async function formatToSlackBlock() {
  const rawText = document.getElementById('rawText').value.trim();
  const apiKey = document.getElementById('apiKey').value.trim();
  const status = document.getElementById('status');
  const output = document.getElementById('blockOutput');
  const outputSection = document.getElementById('outputSection');

  if (!rawText || !apiKey) {
    alert("Please provide both the OpenAI API key and some input text.");
    return;
  }

  status.textContent = "Sending to OpenAI...";

  const prompt = `Convert the following raw text into a valid Slack Block Kit JSON with block elements like "section", "divider", etc., so it can be pasted directly into Slack Block Kit Builder. Output should be a full JSON array of blocks, no extra text. Text:\n\n${rawText}`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3
      })
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(`Error ${response.status}: ${errData.error.message}`);
    }

    const data = await response.json();
    const result = data.choices[0].message.content.trim();

    output.value = result;
    outputSection.classList.remove("hidden");
    status.textContent = "Block generated successfully.";
  } catch (error) {
    console.error("OpenAI API error:", error);
    alert(`Failed to fetch from OpenAI: ${error.message}`);
    status.textContent = "An error occurred.";
  }
}

function copyOutput() {
  const output = document.getElementById('blockOutput');
  output.select();
  document.execCommand("copy");
  alert("Copied to clipboard!");
}

function downloadJSON() {
  const text = document.getElementById('blockOutput').value;
  const blob = new Blob([text], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "slack-block.json";
  link.click();
  URL.revokeObjectURL(url);
}

function clearForm() {
  document.getElementById('rawText').value = "";
  document.getElementById('blockOutput').value = "";
  document.getElementById('apiKey').value = "";
  document.getElementById('outputSection').classList.add("hidden");
  document.getElementById('status').textContent = "";
}
