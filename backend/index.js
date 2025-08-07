// Load environment variables from a .env file into process.env
require("dotenv").config();

// Import express framework for building the server
const express = require("express");
// Import CORS middleware to enable Cross-Origin Resource Sharing
const cors = require("cors");
// Import the OpenAI class from the new SDK
const OpenAI = require("openai");

// Create an Express application instance
const app = express();
// Set the port from environment variable or default to 4000
const port = process.env.PORT || 4000;

// Enable CORS for all incoming requests to allow frontend access
app.use(cors());
// Middleware to parse incoming JSON request bodies automatically
app.use(express.json());

// Configure OpenAI API client with your API key from environment variables
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Define POST endpoint /api/prettify to accept code and return prettified version
app.post("/api/prettify", async (req, res) => {
  // Extract 'code' string from JSON body of request
const { code } = req.body;
console.log("Received code in backend:", code);
console.log("API Key exists?", !!process.env.OPENAI_API_KEY);




  // If no code provided, respond with HTTP 400 Bad Request
if (!code) {
    return res.status(400).json({ error: "No code provided in request body" });
}

try {
    // Create messages array for chat completion API to refactor and prettify the given code
    const messages = [
    {
        role: "system",
        content: "You are a helpful assistant that refactors and prettifies code.",
    },
    {
        role: "user",
        content: `
Refactor and prettify the following code. Improve formatting, fix syntax errors, and clean logic without changing its behavior:

${code}

Prettified code:
        `,
    },
    ];

    // Call OpenAI chat completion API with the messages and parameters
    const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini", // Use a model available to you, e.g., "gpt-4o-mini" or "gpt-4o"
        messages: messages,
        temperature: 0, // Low randomness for deterministic output
        max_tokens: 1000, // Limit output length
    });

    // Extract prettified code from API response, trimming whitespace
    const prettifiedCode = completion.choices[0].message.content.trim();
    // Send prettified code back in JSON response
    res.json({ prettifiedCode });
} catch (error) {
    // Log error and respond with HTTP 500 Internal Server Error if API call fails
    console.error("OpenAI API error:", error);
    res.status(500).json({ error: "Failed to prettify code" });
}
});

// Start Express server and listen on the specified port
app.listen(port, () => {
console.log(`Prettify backend listening at http://localhost:${port}`);
});
