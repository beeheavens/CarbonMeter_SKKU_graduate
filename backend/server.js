const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');
const { MongoClient} = require('mongodb');

const app = express();
const PORT = 12345;

app.use(cors());
app.use(bodyParser.json());

const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);

let db;

// MongoDB 연결
async function connectDB() {
  try {
    await client.connect();
    db = client.db('userDatabase'); // MongoDB 데이터베이스 선택
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('Failed to connect to MongoDB', err);
  }
}

// 서버 시작 시 MongoDB 연결
connectDB();

app.post('/register', async (req, res) => {
  const { email, password } = req.body;

  try {
    const usersCollection = db.collection('users');
    const existingUser = await usersCollection.findOne({ email: email });

    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }

    const result = await usersCollection.insertOne({ email, password });
    if (result.acknowledged) {
      return res.status(201).json({ message: 'User registered successfully!' });
    } else {
      return res.status(500).json({ message: 'Failed to register user' });
    }
  } catch (err) {
    console.error('Error during registration:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// 로그인 엔드포인트
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const usersCollection = db.collection('users');
    const user = await usersCollection.findOne({ email: email });

    if (user && user.password === password) {
      return res.status(200).json({ message: 'Login successful!' });
    }

    return res.status(401).json({ message: 'Invalid credentials' });
  } catch (err) {
    console.error('Error during login:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// 클라이언트에서 전송된 Python 코드를 받아 target.py 파일로 저장하고 실행
// 클라이언트에서 전송된 Python 코드를 받아 target.py 파일로 저장하고 실행
app.post('/evaluate', (req, res) => {
  exec(`rm emissions.csv`); // 기존의 emissions.csv 파일 삭제
  const { email, codeTitle, code } = req.body; // 이메일과 코드 받기
  const targetFilePath = path.join(__dirname, '../targets/target.py');

  // 받은 코드를 줄 단위로 나누고 들여쓰기 추가
  const indentedCode = code.split('\n').map(line => `    ${line}`).join('\n'); 

  // CodeCarbon 데코레이터와 함께 클라이언트에서 받은 코드 구성
  const codeWithTracking = `
from codecarbon import track_emissions

@track_emissions()
def my_function():
${indentedCode}

my_function()
  `;

  // 구성된 코드를 target.py에 저장
  fs.writeFile(targetFilePath, codeWithTracking, (err) => {
    if (err) {
      console.error('Failed to write Python code to file:', err);
      return res.status(500).json({ message: 'Failed to save code' });
    }

    // Python 파일 실행
    exec(`python3 ${targetFilePath}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing Python script: ${error.message}`);
        return res.status(500).json({ message: 'Failed to execute code' });
      }

      // emissions.csv 파일에서 결과 읽기
      const emissionsFilePath = path.join(__dirname, './emissions.csv');
      fs.readFile(emissionsFilePath, 'utf8', async (err, data) => {
        if (err) {
          console.error('Failed to read emissions.csv:', err);
          return res.status(500).json({ message: 'Failed to read emissions data' });
        }

        // 필요한 데이터만 필터링해서 클라이언트로 전송 및 MongoDB에 저장
        const emissionsData = parseFilteredCSV(data)[0];

        try {
          const evalRecordCollection = db.collection('evalRecord');
          await evalRecordCollection.insertOne({
            email, // 사용자의 이메일 저장
            codeTitle,
            emissionsData, // 파싱된 데이터 저장
            code,
          });
          res.json(emissionsData);
        } catch (dbErr) {
          console.error('Failed to save to MongoDB:', dbErr);
          return res.status(500).json({ message: 'Failed to save evaluation data' });
        }
      });
    });
  });
});

// CSV 파일을 파싱하고 필요한 값만 추출하는 함수
function parseFilteredCSV(data) {
  const lines = data.split('\n');
  const headers = lines[0].split(',');
  const result = [];

  const requiredFields = ['timestamp', 'run_id', 'emissions', 'cpu_power', 'cpu_energy', 'energy_consumed', 'country_name', 'region'];

  for (let i = 1; i < lines.length; i++) {
    const currentLine = lines[i].split(',');
    const obj = {};

    headers.forEach((header, index) => {
      if (requiredFields.includes(header)) {
        obj[header] = currentLine[index];
      }
    });

    if (Object.keys(obj).length > 0) {
      result.push(obj);
    }
  }

  return result;
}

app.post('/getRecords', async (req, res) => {
  const { email } = req.body;
  try {
    const records = await db.collection('evalRecord').find({ email }).toArray();
    res.json(records);
  } catch (err) {
    console.error('Error fetching records:', err);
    res.status(500).json({ message: 'Failed to fetch records' });
  }
});

app.post('/deleteRecord', async (req, res) => {
  const { codeTitle } = req.body;
  try {
    const result = await db.collection('evalRecord').deleteOne({ codeTitle : codeTitle });

    if (result.deletedCount === 1) {
      res.status(200).json({ message: 'Record deleted successfully' });
    } else {
      res.status(404).json({ message: 'Record not found' });
    }
  } catch (error) {
    console.error('Error deleting record:', error);
    res.status(500).json({ message: 'Failed to delete record' });
  }
});

app.post('/getRecordByCodeTitle', async (req, res) => {
  const { codeTitle } = req.body;
  
  try {
    const record = await db.collection('evalRecord').findOne({ codeTitle });
    if (record) {
      res.status(200).json(record);
    } else {
      res.status(404).json({ message: 'Record not found' });
    }

    console.log(record);
  } catch (error) {
    console.error('Error fetching record:', error);
    res.status(500).json({ message: 'Failed to fetch record' });
  }
});

// 클라이언트에서 전송된 Python 코드를 비교하는 엔드포인트
app.post('/compare', async (req, res) => {
  exec(`rm emissions.csv`); // 기존의 emissions.csv 파일 삭제
  const { codeTitle, userCode } = req.body; // 사용자의 코드와 MongoDB의 codeTitle

  try {
    // 1. MongoDB에서 codeTitle로 기존 코드 데이터를 가져옴
    const storedRecord = await db.collection('evalRecord').findOne({ codeTitle });
    if (!storedRecord) {
      return res.status(404).json({ message: 'Record not found' });
    }

    // 2. 사용자의 코드를 target.py로 저장하고 실행
    const targetFilePath = path.join(__dirname, '../targets/target.py');
    const indentedCode = userCode.split('\n').map(line => `    ${line}`).join('\n'); // 들여쓰기 추가
    const codeWithTracking = `
from codecarbon import track_emissions

@track_emissions()
def my_function():
${indentedCode}

my_function()
    `;

    fs.writeFile(targetFilePath, codeWithTracking, (err) => {
      if (err) {
        console.error('Failed to write Python code to file:', err);
        return res.status(500).json({ message: 'Failed to save code' });
      }

      // Python 파일 실행
      exec(`python3 ${targetFilePath}`, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error executing Python script: ${error.message}`);
          return res.status(500).json({ message: 'Failed to execute code' });
        }

        // emissions.csv 파일에서 사용자의 코드 실행 결과 읽기
        const emissionsFilePath = path.join(__dirname, './emissions.csv');
        fs.readFile(emissionsFilePath, 'utf8', (err, data) => {
          if (err) {
            console.error('Failed to read emissions.csv:', err);
            return res.status(500).json({ message: 'Failed to read emissions data' });
          }

          // 사용자의 코드 실행 결과 파싱
          const userEmissionsData = parseFilteredCSV(data)[0];

          // 3. 기존 코드와 사용자 코드의 결과 비교
          console.log(userEmissionsData);
          const energyDifference = (userEmissionsData.energy_consumed - storedRecord.emissionsData.energy_consumed);
          const emissionDifference = (userEmissionsData.emissions - storedRecord.emissionsData.emissions);
          const cpuEnergyDifference = (userEmissionsData.cpu_energy - storedRecord.emissionsData.cpu_energy);

          // 4. 비교 결과 클라이언트로 전송
          res.json({
            storedRecord,
            userEmissionsData,
            energyDifference,
            emissionDifference,
            cpuEnergyDifference,
            
          });
        });
      });
    });
  } catch (error) {
    console.error('Error during code comparison:', error);
    res.status(500).json({ message: 'Failed to compare codes' });
  }
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
