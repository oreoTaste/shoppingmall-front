require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5001;

// CORS 설정만 남겨둡니다. body-parser나 multer는 사용하지 않습니다.
app.use(cors({
  origin: process.env.LOCAL_APP_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: 'Content-Type, Accept, Authorization, Origin',
  credentials: true,
}));


// 모든 경로의 요청을 처리하는 프록시 핸들러
app.all('/*', async (req, res) => {
  const forwardPath = req.originalUrl;
  const targetUrl = `${process.env.SPRING_API_URL}${forwardPath}`;

  console.log(`[Proxy Pipe] Request: ${req.method} ${forwardPath}`);
  console.log(`[Proxy Pipe] Forwarding to: ${targetUrl}`);

  try {
    const forwardHeaders = { ...req.headers };
    // 'host' 헤더는 백엔드 서버의 주소로 자동 설정되도록 제거합니다.
    delete forwardHeaders.host;

    // [핵심] axios 요청의 'data'로 들어온 요청(req) 스트림을 그대로 전달합니다.
    // 이렇게 하면 요청 본문을 파싱하거나 재조립하지 않고 원본 그대로 보냅니다.
    const response = await axios({
      method: req.method,
      url: targetUrl,
      headers: forwardHeaders,
      data: req, // 요청 스트림을 그대로 데이터로 사용
      responseType: 'stream', // 응답도 스트림으로 받음
    });

    console.log(`[Proxy Pipe] Backend Response Status: ${response.status}`);

    // 백엔드의 응답 헤더와 상태 코드를 클라이언트로 전달
    res.status(response.status);
    for (const [key, value] of Object.entries(response.headers)) {
      res.setHeader(key, value);
    }
    
    // 백엔드의 응답 본문을 클라이언트로 스트리밍
    response.data.pipe(res);

  } catch (error) {
    console.error('[Proxy Pipe] Error during proxy request:', error.message);
    if (error.response) {
      console.error(`[Proxy Pipe] Backend responded with Status: ${error.response.status}`);
      res.status(error.response.status);
      error.response.data.pipe(res);
    } else if (error.request) {
      res.status(504).json({ message: 'Gateway Timeout' });
    } else {
      res.status(500).json({ message: 'Proxy Server Internal Error' });
    }
  }
});


// 서버 시작
app.listen(port, () => {
  console.log(`✅ Proxy server (Pipe Mode) is running on port ${port}`);
});
