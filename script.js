async function generateBlock() {
    const apiKey = document.getElementById("apiKey").value.trim();
    const rawText = document.getElementById("rawText").value.trim();
  
    if (!apiKey || !rawText) {
      alert("Please enter both an API key and some text.");
      return;
    }
  
    const prompt = `Convert the following message into a valid Slack Block Kit JSON object.
The output should be professionally styled—no emojis, casual language, or informal tone.
This message will be used for a formal update, so ensure the layout is clean and business-appropriate.
Return only the JSON object—no additional commentary, explanations, or formatting.
Message: ${rawText}"`;
  
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4", // or "gpt-3.5-turbo"
        messages: [
          { role: "user", content: prompt }
        ],
        temperature: 0.2
      })
    });
  
    const data = await response.json();
    const output = data.choices?.[0]?.message?.content?.trim() || "No response from OpenAI";
  
    document.getElementById("output").value = output;
  }
  
  function copyToClipboard() {
    const output = document.getElementById("output");
    output.select();
    document.execCommand("copy");
    alert("Copied to clipboard!");
  }
  
  function downloadJSON() {
    const blob = new Blob([document.getElementById("output").value], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "slack-block.json";
    a.click();
  }
  
  function clearFields() {
    document.getElementById("rawText").value = "";
    document.getElementById("output").value = "";
  }
  
