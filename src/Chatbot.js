import { useState } from "react";
import axios from "axios";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { darcula } from "react-syntax-highlighter/dist/esm/styles/prism";
import "bootstrap/dist/css/bootstrap.min.css";

const API_KEY = "AIzaSyA6nsavJXcz5m9HrGc4YS8YSKwHBKd8Aa8"; // Replace with your actual API key
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

const Chatbot = () => {
  const [prompt, setPrompt] = useState("");
  const [responseText, setResponseText] = useState("");
  const [codeBlocks, setCodeBlocks] = useState([]);
  const [errorList, setErrorList] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!prompt) return alert("Please enter a prompt!");

    setLoading(true);
    try {
      const res = await axios.post(API_URL, {
        contents: [{ parts: [{ text: prompt }] }],
      });

      const reply = res.data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response.";
      processResponse(reply);
    } catch (error) {
      console.error("Error fetching response:", error);
      setResponseText("Error: Unable to fetch response.");
      setCodeBlocks([]);
      setErrorList([]);
    }
    setLoading(false);
  };

  const processResponse = (response) => {
    const codeRegex = /```(\w*)\n([\s\S]*?)```/g;
    const errorRegex = /\d+\.\s(.*?)[:\n]/g; // Matches error messages like "1. Error: message"

    let match;
    let extractedCode = [];
    let extractedErrors = [];
    let plainText = response;

    // Extract code blocks
    while ((match = codeRegex.exec(response)) !== null) {
      extractedCode.push({
        language: match[1] || "java",
        code: match[2],
      });

      // Remove code from plain text
      plainText = plainText.replace(match[0], "").trim();
    }

    // Extract errors
    while ((match = errorRegex.exec(response)) !== null) {
      extractedErrors.push(match[1]);
    }

    setResponseText(plainText);
    setCodeBlocks(extractedCode);
    setErrorList(extractedErrors);
  };

  return (
    <div className="container mt-5 p-4 bg-white shadow-lg rounded">
      <h2 className="mb-3">Gemini AI Chat</h2>
      <textarea
        className="form-control mb-2"
        placeholder="Enter your prompt..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />
      <button className="btn btn-primary mt-2" onClick={handleSend} disabled={loading}>
        {loading ? "Loading..." : "Send"}
      </button>

      <div className="mt-4 p-3 bg-light border rounded">
        <strong>Response:</strong>
        {responseText && <p>{responseText}</p>}

        {errorList.length > 0 && (
          <div className="mt-3">
            <strong>Errors:</strong>
            <ul>
              {errorList.map((error, index) => (
                <li key={index} className="text-danger">
                  {error}
                </li>
              ))}
            </ul>
          </div>
        )}

        {codeBlocks.length > 0 && (
          <div className="mt-3">
            <strong>Corrected Code:</strong>
            {codeBlocks.map((block, index) => (
              <SyntaxHighlighter key={index} language={block.language} style={darcula} className="rounded mt-2">
                {block.code}
              </SyntaxHighlighter>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Chatbot;
