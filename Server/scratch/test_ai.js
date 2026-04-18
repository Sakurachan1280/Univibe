const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const token = process.env.GITHUB_TOKEN;
const endpoint = "https://models.inference.ai.azure.com/chat/completions";

async function test() {
    try {
        console.log("Token exists:", !!token);
        const response = await axios.post(endpoint, {
            messages: [
                { role: "system", content: "Return a JSON array of 1 number: [123]" },
                { role: "user", content: "test" }
            ],
            model: "gpt-4o"
        }, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        console.log("Response:", response.data.choices[0].message.content);
    } catch (e) {
        console.error("Error:", e.response?.data || e.message);
    }
}

test();
