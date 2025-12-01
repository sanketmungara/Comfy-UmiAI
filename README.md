# 📘 UmiAI Wildcard Processor

[![Join Discord](https://img.shields.io/badge/Discord-Join%20Umi%20AI-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/9K7j7DTfG2)

**A "Logic Engine" for ComfyUI Prompts.**

UmiAI transforms static prompts into dynamic, context-aware workflows. It introduces **Persistent Variables**, **Conditional Logic**, **Native LoRA Loading**, and **External Data Fetching** directly into your prompt text box.

## ✨ Key Features

* **🔋 Native LoRA Loading:** Type `<lora:filename:1.0>` directly in the text. The node patches the model internally—no external LoRA Loader nodes required.
* **🛠️ Z-Image Support:** Automatically detects and fixes Z-Image format LoRAs (QKV Fusion) on the fly.
* **🧠 Persistent Variables:** Define a choice once (`$hair={Red|Blue}`) and reuse it (`$hair`) anywhere to ensure consistency.
* **🔀 Conditional Logic:** `[if keyword : True Text | False Text]` logic gates. Perfect for ensuring outfits match genres.
* **🌍 Global Presets:** Automatically load variables from `wildcards/globals.yaml` into *every* prompt.
* **🎨 Danbooru Integration:** Type `char:name` to automatically fetch visual tags from Danbooru.
* **📏 Resolution Control:** Set `@@width=1024@@` inside your prompt to control image size contextually.

---

## 🛠️ Installation

### Method 1: Manual Install (Recommended)
1.  Navigate to your `ComfyUI/custom_nodes/` folder.
2.  Clone this repository:
    ```bash
    git clone https://github.com/Tinuva88/Comfy-UmiAI
    ```
3.  **⚠️ IMPORTANT:** Rename the folder to `ComfyUI-UmiAI` if it isn't already.
4.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
5.  **Restart ComfyUI** completely.

### Method 2: ComfyUI Manager
* **Install via Git URL:** Copy the URL of this repository and paste it into ComfyUI Manager.

---

## 🔌 Wiring Guide (The "Passthrough" Method)

The UmiAI node acts as the "Central Brain". You must pass your **Model** and **CLIP** through it so it can apply LoRAs automatically.

### 1. The Main Chain
1.  Connect **Checkpoint Loader (Model & CLIP)** ➔ **UmiAI Node (Inputs)**.
2.  Connect **UmiAI Node (Model & CLIP)** ➔ **KSampler** / **Positive Prompt**.

### 2. Connect Prompts
* **Text Output** ➔ `CLIP Text Encode` (Positive)
* **Negative Output** ➔ `CLIP Text Encode` (Negative)

### 3. Connect Resolution (Crucial!)
To allow the node to control image size (e.g., `@@width=1024@@`):
1.  **Right-Click** your `Empty Latent Image` node.
2.  Select **Convert width to input** & **Convert height to input**.
3.  Connect the **Width/Height** wires from UmiAI to the Latent node.

> **⚠️ Note on Batch Size:**
> Use the **"Queue Batch"** setting in the ComfyUI Extra Options menu to generate variations. Do not use the widget batch size.

---

## ⚡ Syntax Cheat Sheet

| Feature | Syntax | Example |
| :--- | :--- | :--- |
| **Load LoRA** | `<lora:name:str>` | `<lora:pixel_art:0.8>` |
| **Random Choice** | `{a\|b\|c}` | `{Red\|Blue\|Green}` |
| **Variables** | `$var={opts}` | `$hair={Red\|Blue}` |
| **Use Variable** | `$var` | `A photo of $hair hair.` |
| **Logic Gate** | `[if Key : A \| B]` | `[if Cyberpunk : Techwear \| Armor]` |
| **Danbooru** | `char:name` | `char:frieren` |
| **Sequential** | `{~a\|b\|c}` | `{~Front\|Side\|Back}` |
| **Set Size** | `@@w=X, h=Y@@` | `@@width=1024, height=1536@@` |
| **Comments** | `//` or `#` | `// This is a comment` |

---

## 🔋 LoRA & Z-Image System

You no longer need to chain multiple LoRA Loader nodes. UmiAI handles it internally.

### Basic Usage
Type `<lora:` to trigger the autocomplete menu.
```text
<lora:my_style_v1:0.8>
```

### Z-Image Auto-Detection
If you are using **Z-Image** LoRAs (which normally require special loaders due to QKV mismatch), UmiAI handles this automatically.
1.  Load the file using the standard syntax: `<lora:z-image-anime:1.0>`
2.  The node detects the key format and applies the **QKV Fusion Patch** instantly.

### Dynamic LoRAs
You can use wildcards or logic to switch LoRAs per generation:
```text
// Randomly pick a style LoRA
{ <lora:anime_style:1.0> | <lora:realistic_v2:0.8> }
```

---

## 📂 Creating Wildcards

UmiAI reads files from the `wildcards/` folder.

### 1. Simple Text Lists (.txt)
Create `wildcards/colors.txt`:
```text
Red
Blue
Green
```
**Usage:** Type `__` to select `__colors__`.

### 2. Advanced Tag Lists (.yaml)
Create `wildcards/styles.yaml` (You can hide LoRAs here!):
```yaml
Cyberpunk:
    Tags: <lora:neon_city:0.8>
    Prompts: ["neon lights", "chrome", "high tech"]
```
**Usage:** Type `<` to select `<[Cyberpunk]>`.

---

## 🚀 Example Workflow: The "Context-Aware" Character

Copy this prompt into the node to test Logic, Variables, and internal LoRA loading.

```text
// 1. Define Variables & Style
$genre={High Fantasy|Cyberpunk}
$view={~Portrait|Landscape}

// 2. Logic: Set LoRA and Resolution based on Genre/View
[if Cyberpunk: <lora:cyberpunk_v3:0.8>][if Fantasy: <lora:rpg_tools:1.0>]
[if Portrait: @@width=1024, height=1536@@][if Landscape: @@width=1536, height=1024@@]

// 3. Main Prompt
(Masterpiece), A $view of a warrior, female.

// 4. Context Logic (Outfit changes based on Genre variable)
She is wearing [if Fantasy: plate armor | [if Cyberpunk: tech jacket]].

The background is a $genre landscape.
**watermark, text, blurry, nsfw**
```

---

## 💬 Community & Support

Join the **Umi AI** Discord server to share workflows and get help!

👉 **[Join our Discord Server](https://discord.gg/9K7j7DTfG2)**