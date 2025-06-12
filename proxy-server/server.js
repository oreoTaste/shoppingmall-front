require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
const multer = require('multer');
const FormData = require('form-data');
const fs = require('fs');
const app = express();

const port = process.env.PORT || 5001; // .env 파일에 PORT가 없으면 5001을 기본값으로 사용

// --- 기본 설정 ---

// 무한 타임아웃 설정 (필요에 따라 조정)
app.use((req, res, next) => {
  req.setTimeout(0);
  res.setTimeout(0);
  next();
});

// JSON 및 URL-encoded 요청 본문을 파싱하기 위한 미들웨어
// 높은 용량 한도를 설정하여 대용량 파일 정보 전송에 대비
app.use(express.json({ limit: '1024mb' }));
app.use(express.urlencoded({ extended: true, limit: '1024mb' }));

// 세션 미들웨어 설정
app.use(
  session({
    secret: 'my-secret-key', // 보안을 위해 복잡한 문자열로 변경하는 것을 권장합니다.
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 쿠키 유효 기간: 1일
    },
  })
);

// CORS 미들웨어 설정
app.use(cors({
  origin: [
    process.env.LOCAL_APP_URL, // React 개발 서버 주소
    process.env.SPRING_API_URL // Spring API 서버 주소
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: 'Content-Type, Accept, Authorization, Origin',
  credentials: true,
}));

// --- 파일 업로드 설정 (Multer) ---

// 업로드된 파일을 임시 저장할 디렉토리
const uploadDir = './uploads';
// 서버 시작 시 디렉토리가 없으면 생성
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, uploadDir);
  },
  filename: (req, file, callback) => {
    // 파일명 중복을 피하기 위해 고유한 접두사를 붙임
    const uniqueSuffix = Date.now() + '_' + Math.round(Math.random() * 1e9);
    // 원본 파일의 인코딩을 UTF-8로 명확히 처리
    const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
    callback(null, `${uniqueSuffix}-${originalName}`);
  },
});
const upload = multer({ storage });


// --- API 프록시 미들웨어 ---

const apiProxy = async (req, res) => {
  const targetUrl = `${process.env.SPRING_API_URL}${req.originalUrl}`;
  console.log(`[Proxy] ==> Request: ${req.method} ${req.originalUrl}`);
  console.log(`[Proxy] ==> Forwarding to: ${targetUrl}`);

  try {
    const forwardHeaders = { ...req.headers };
    // 'host' 헤더는 프록시 서버의 호스트이므로, 실제 백엔드 서버로 요청 시에는 삭제하는 것이 안전합니다.
    // axios가 targetUrl을 기반으로 올바른 host 헤더를 설정합니다.
    delete forwardHeaders.host;

    let requestData;
    const contentType = req.headers['content-type'] || '';

    // 1. JSON 요청 처리 (로그인 등 대부분의 API 요청)
    if (contentType.includes('application/json')) {
      console.log('[Proxy] ==> Handling application/json request.');
      // express.json() 미들웨어가 이미 req.body를 파싱된 JS 객체로 만들어 줍니다.
      requestData = req.body;
      console.log('[Proxy] ==> Forwarding JSON body:', JSON.stringify(requestData));
    }
    // 2. 멀티파트(파일 업로드) 요청 처리
    else if (contentType.startsWith('multipart/form-data')) {
      console.log('[Proxy] ==> Handling multipart/form-data request.');
      const form = new FormData();

      // 텍스트 필드(req.body)를 FormData에 추가
      for (const [key, value] of Object.entries(req.body)) {
        form.append(key, value);
      }
      
      // 파일(req.files)을 FormData에 추가
      if (req.files && req.files.length > 0) {
        console.log(`[Proxy] ==> Attaching ${req.files.length} file(s).`);
        req.files.forEach(file => {
          // Spring 백엔드에서 @RequestPart("files") 로 받을 수 있도록 키 이름을 지정
          form.append('files', fs.createReadStream(file.path), file.originalname);
        });
      }

      requestData = form;
      // form-data 라이브러리가 생성한 헤더(Content-Type, Content-Length 등)를 요청 헤더에 병합
      Object.assign(forwardHeaders, form.getHeaders());
    }
    // 3. [추가] x-www-form-urlencoded 요청 처리
    else if (contentType.startsWith('application/x-www-form-urlencoded')) {
        console.log('[Proxy] ==> Handling application/x-www-form-urlencoded request.');
        // express.urlencoded()가 파싱한 req.body 객체를 다시 쿼리 문자열로 변환합니다.
        requestData = new URLSearchParams(req.body).toString();
        console.log('[Proxy] ==> Forwarding Form-URL-Encoded body:', requestData);
        // Content-Type 헤더를 명시적으로 설정합니다.
        forwardHeaders['content-type'] = 'application/x-www-form-urlencoded';
    }
    // 4. 기타 요청 (GET 요청 등 body가 없는 경우)
    else {
      console.log(`[Proxy] ==> Handling other request type (Content-Type: ${contentType}).`);
      requestData = req.body;
    }

    // axios를 사용하여 백엔드 서버로 요청 전달
    const response = await axios({
      method: req.method,
      url: targetUrl,
      headers: forwardHeaders,
      data: requestData,
      responseType: 'stream', // 큰 파일 다운로드 등을 위해 응답을 스트림으로 받음
      timeout: 180000, // 타임아웃 3분
      maxContentLength: Infinity, // 요청 본문 최대 크기 제한 없음
      maxBodyLength: Infinity,    // 응답 본문 최대 크기 제한 없음
    });


    console.log(`[Proxy] <== Backend Response Status: ${response.status}`);

    // 백엔드 응답 헤더를 클라이언트로 전달 (Set-Cookie 포함)
    res.status(response.status);
    for (const [key, value] of Object.entries(response.headers)) {
      res.setHeader(key, value);
    }

    // 백엔드 응답 본문을 클라이언트로 스트리밍
    response.data.pipe(res);

  } catch (error) {
    console.error('[Proxy] <== Error during proxy request:', error.message);
    if (error.response) {
      // 백엔드 서버가 에러 코드로 응답한 경우
      console.error(`[Proxy] <== Backend responded with Status: ${error.response.status}`);
      res.status(error.response.status);
      // 백엔드의 에러 응답을 그대로 클라이언트에 스트리밍
      error.response.data.pipe(res);
    } else if (error.request) {
      // 요청은 성공했으나 응답을 받지 못한 경우
      res.status(504).json({ message: '백엔드 서버로부터 응답이 없습니다. (Gateway Timeout)' });
    } else {
      // 요청 설정 중 에러가 발생한 경우
      res.status(500).json({ message: '프록시 서버 내부 오류가 발생했습니다.' });
    }
  } finally {
    // 요청 처리 후 임시로 저장된 업로드 파일 삭제
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        fs.unlink(file.path, (err) => {
          if (err) console.error(`[Proxy] Failed to delete temp file: ${file.path}`, err);
        });
      }
    }
  }
};

// --- 라우팅 설정 ---

// 모든 경로의 요청을 `upload` 미들웨어로 처리 후 `apiProxy`로 전달
// `upload.any()`는 모든 이름의 파일을 허용하고 req.files에 배열로 저장합니다.
app.use('/', upload.any(), apiProxy);


// --- 서버 시작 ---
app.listen(port, () => {
  console.log(`✅ Proxy server is running on port ${port}`);
});