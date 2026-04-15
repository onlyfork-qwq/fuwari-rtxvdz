// 极验验证后端API示例
// 这是一个Node.js Express服务器示例，你可以部署到Vercel、Netlify等平台

import axios from "axios";
import crypto from "crypto";
import express from "express";

const app = express();
app.use(express.json());

// 极验配置 - 从环境变量读取
const CAPTCHA_ID = process.env.GEETEST_CAPTCHA_ID || "";
const CAPTCHA_KEY = process.env.GEETEST_CAPTCHA_KEY || "";
const API_SERVER = "https://gcaptcha4.geetest.com";
const API_URL = `${API_SERVER}/validate?captcha_id=${CAPTCHA_ID}`;

// 生成HMAC-SHA256签名
function hmacSha256Encode(value, key) {
	return crypto.createHmac("sha256", key).update(value, "utf8").digest("hex");
}

// 验证极验token
async function verifyGeetestToken(data) {
	const { lot_number, captcha_output, pass_token, gen_time } = data;

	// 生成签名
	const sign_token = hmacSha256Encode(lot_number, CAPTCHA_KEY);

	// 准备请求数据
	const requestData = {
		lot_number,
		captcha_output,
		pass_token,
		gen_time,
		sign_token,
	};

	try {
		// 向极验服务器发送验证请求
		const response = await axios.post(API_URL, requestData, {
			headers: {
				"Content-Type": "application/json",
			},
			timeout: 5000,
		});

		return response.data;
	} catch (error) {
		console.error("极验验证请求失败:", error.message);
		// 当请求Geetest服务接口出现异常，应放行通过，以免阻塞正常业务
		return { result: "success", reason: "geetest_service_error" };
	}
}

// 验证API端点
app.post("/api/verify-geetest", async (req, res) => {
	try {
		const { lot_number, captcha_output, pass_token, gen_time } = req.body;

		// 验证必要参数
		if (!lot_number || !captcha_output || !pass_token || !gen_time) {
			return res.status(400).json({
				success: false,
				error: "缺少必要参数",
			});
		}

		// 验证极验token
		const result = await verifyGeetestToken({
			lot_number,
			captcha_output,
			pass_token,
			gen_time,
		});

		if (result.result === "success") {
			return res.json({
				success: true,
				message: "验证成功",
				data: result,
			});
		}
		return res.json({
			success: false,
			error: result.reason || "验证失败",
			data: result,
		});
	} catch (error) {
		console.error("验证过程出错:", error);
		return res.status(500).json({
			success: false,
			error: "服务器内部错误",
		});
	}
});

// 健康检查端点
app.get("/api/health", (req, res) => {
	res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`极验验证服务器运行在端口 ${PORT}`);
	console.log(`验证端点: http://localhost:${PORT}/api/verify-geetest`);
});

export default app;
