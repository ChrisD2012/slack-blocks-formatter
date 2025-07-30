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

  const prompt = `You are an expert Slack Block Kit formatter.

Convert the following raw text message into a professional Slack Block Kit JSON array of blocks suitable for a broad audience. 

- Use "section" and "divider" blocks where appropriate.
- No emojis or informal language.
- include headers and sections
- Structure the content clearly with sections separated by dividers.
- Return strictly valid JSON that can be directly pasted into https://app.slack.com/block-kit-builder without modification.
- Do not include any explanation, code blocks, or extra text—only the JSON array.
- Follow the formatting used by Slack Blocks
-Ensure to provide Object in out put

Message:
${rawText}`;

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
    const rawResult = data.choices[0].message.content.trim();

    try {
      const blocksArray = JSON.parse(rawResult);
      const wrappedResult = { blocks: blocksArray };

      output.value = JSON.stringify(wrappedResult, null, 2);
      renderBlockPreview(blocksArray);
    } catch (parseError) {
      output.value = rawResult;
      console.error("JSON parsing error:", parseError);
    }

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
  document.getElementById('blockPreview').innerHTML = "";
}

function renderBlockPreview(blocks) {
  const preview = document.getElementById("blockPreview");
  preview.innerHTML = "";

  blocks.forEach(block => {
    let el;

    switch (block.type) {
      case "header":
        el = document.createElement("div");
        el.className = "text-lg font-bold text-gray-800";
        el.textContent = block.text?.text || "";
        break;

      case "section":
        el = document.createElement("div");
        el.className = "text-gray-700";
        el.textContent = block.text?.text || "";
        break;

      case "divider":
        el = document.createElement("hr");
        el.className = "border-t border-gray-300";
        break;

      default:
        el = document.createElement("div");
        el.className = "text-gray-500 italic";
        el.textContent = `[Unsupported block type: ${block.type}]`;
    }

    preview.appendChild(el);
  });
}
