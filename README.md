# 📘 UmiAI Wildcard Processor

[![Join Discord](https://img.shields.io/badge/Discord-Join%20Umi%20AI-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/9K7j7DTfG2)

**The "Multimodal Brain" for ComfyUI Prompts.**

UmiAI transforms static prompts into dynamic, context-aware workflows. It combines **Advanced Logic**, **Persistent Variables**, **Native LoRA Loading**, and now **Local Vision & LLM Intelligence** directly into your prompt text box.

> 🚨 **CRITICAL UPDATE NOTICE** 🚨
> 
> **If you are updating from an older version:**
> The internal logic engine has been completely rewritten. You **MUST** right-click the UmiAI Node in your workflow and select **Fix Node (Recreate)** (or delete and re-add it). 
>
> If you do not do this, the new inputs and logic operators will not load, and your workflow may fail.

---

## ✨ Key Features

* **👁️ Vision-to-Text (New):** Connect an image and use `[VISION]` to auto-caption it using local models like **JoyCaption (Alpha 2)** or **Llava**.
* **🧠 Dual LLM Pipeline:** Chain a Vision model (to see) with a Text Refiner (to write) for high-quality, natural language prompt generation.
* **🔋 Native LoRA Loading:** Type `<lora:filename:1.0>` directly in the text. The node patches the model internally. No external LoRA Loader nodes required.
* **🔄 Auto-Updater:** Includes a built-in switch to auto-update and patch `llama-cpp-python` for CUDA compatibility.
* **🔀 Advanced Logic Engine:** Full support for `AND`, `OR`, `NOT`, `XOR`, and `( )` grouping. Use it to filter wildcards or conditionally change prompt text.
* **💲 Persistent Variables:** Define a choice once (`$hair={Red|Blue}`) and reuse it (`$hair`) anywhere to ensure consistency.
* **🛠️ Z-Image Support:** Automatically detects and fixes Z-Image format LoRAs (QKV Fusion) on the fly.
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

The UmiAI node acts as the "Central Brain". To use all features (LoRA, Vision, Resolution), wire it as follows:

1.  **Model & CLIP (Required for LoRA):**
    * Connect **Checkpoint Loader** &#10142; **UmiAI Node** (Model/Clip Inputs).
    * Connect **UmiAI Node** (Model/Clip Outputs) &#10142; **KSampler**.
2.  **Image (Required for Vision):**
    * Connect an **Image** source (Load Image/VAE Decode) &#10142; **UmiAI Node** (`image` input).
3.  **Prompts & Resolution:**
    * **Text Output** &#10142; `CLIP Text Encode` (Positive)
    * **Negative Output** &#10142; `CLIP Text Encode` (Negative)
    * **Width/Height** &#10142; `Empty Latent Image`

> **Note:** To let the node control image size (e.g., `@@width=1024@@`), right-click your **Empty Latent Image** node and select **Convert width/height to input**.

---

## 👁️ Vision & LLM Guide

UmiAI uses a **Two-Stage Pipeline** to generate prompts. You can use just one stage or both.

### Stage 1: Vision (The Eye)
* **Role:** Looks at the input image and describes it.
* **Models:**
    * **JoyCaption-Alpha-2:** Best accuracy, currently the SOTA for captioning.
    * **Llava-v1.5-7b:** Reliable standard vision model.
* **Usage:**
    * Connect an image to the node.
    * Select a `vision_model`.
    * Type `[VISION]` in your prompt box. The node will replace that tag with the model's description of the image.
    * *Advanced:* `[VISION: Describe only the clothing]`

### Stage 2: Refiner (The Writer)
* **Role:** Takes the raw description (or your rough text) and rewrites it into a beautiful prompt.
* **Models:**
    * **Qwen2.5-1.5B:** Fast, smart, low VRAM.
    * **Dolphin-Llama3.1-8B:** Creative, uncensored, follows instructions well.
    * **Wingless Imp 8B:** Great for creative roleplay descriptions.
* **Usage:**
    * Select a `refiner_model`.
    * Type `[LLM: 1girl, red dress, beach]` in your prompt.
    * The node will rewrite that simple list into a full paragraph based on your **Custom System Prompt**.

### ⚡ Auto-Download & Update
* **Model Download:** If you select a "Download:" model in the list, UmiAI will automatically download it from HuggingFace to `models/llm` on the first run.
* **Library Update:** If you get errors regarding "Vision Projector" or CUDA, toggle the **update_llama_cpp** widget to `True` (Update & Restart) and queue a prompt. The node will attempt to reinstall the correct wheels for your CUDA version.

---

## ⚡ Syntax Cheat Sheet

| Feature | Syntax | Example |
| :--- | :--- | :--- |
| **Vision Tag** | `[VISION]` | `[VISION]` or `[VISION: describe background]` |
| **LLM Rewrite** | `[LLM: text]` | `[LLM: 1girl, cyberpunk city]` |
| **Load LoRA** | `<lora:name:str>` | `<lora:pixel_art:0.8>` |
| **Random Choice** | `{a\|b\|c}` | `{Red\|Blue\|Green}` |
| **Logic (Prompt)** | `[if Logic : True \| False]` | `[if red AND blue : Purple \| Grey]` |
| **Logic (Wildcard)**| `__[Logic]__` | `__[fire OR (ice AND magic)]__` |
| **Variables** | `$var={opts}` | `$hair={Red\|Blue}` |
| **Use Variable** | `$var` | `She has $hair hair` |
| **Danbooru** | `char:name` | `char:tifa_lockhart` |
| **Set Size** | `@@w=X, h=Y@@` | `@@width=1024, height=1536@@` |
| **Negative (Local)**| `**text**` | `A nice cat **bad quality, blurry**` |

---

## 🧠 Advanced Boolean Logic

UmiAI features a unified logic engine that works in both your **Prompts** and your **Wildcard Filters**.

### Supported Operators
* **AND**: Both conditions must be true.
* **OR**: At least one condition must be true.
* **NOT**: The condition must be absent/false.
* **XOR**: Only one condition can be true (Exclusive OR).
* **()**: Parentheses for grouping complex logic.

### 1. Logic in Prompts (`[if ...]`)
You can change the text of your prompt based on other words present in the prompt (or variables).

```text
// Simple check: If 'red' AND 'blue' are present, output 'Purple'.
[if red AND blue : Purple | Grey]

// Variable check: If $char is defined as 'robot', add oil.
[if $char=robot : leaking oil | sweating]

### 2. Logic in Wildcards (`__[ ... ]__`)
Search your Wildcards and YAML cards (Global Index) for entries that match specific tags.

Plaintext

// Find a wildcard that has the tag "dress" but NOT "red"
__[dress AND NOT red]__

// Variable check: If $char is defined as 'robot', add oil.
[if $char=robot : leaking oil | sweating]

// Complex grouping
[if (scifi OR cyber) AND NOT space : futuristic city | nature landscape]
```

---

## 🧠 Integrated LLM (Prompt Naturalizer)

Turn "tag soup" (e.g., 1girl, solo, beach) into lush, descriptive prose using a local Large Language Model.

**Setup & Settings**
**Select Model:** In the llm_model widget, select "Download Recommended". You can choose between:

**Qwen2.5-1.5B (Fast)**: Low RAM usage, good for quick descriptions.

**Dolphin-Llama3.1-8B (Smart)**: Uncensored, follows complex instructions perfectly.

Enable: Set naturalize_prompt to Yes.

Hardware: The LLM runs entirely on your CPU/RAM to preserve your GPU VRAM for image generation.

**Customization Widgets**
**Temperature:** Controls creativity. 0.7 is standard. Lower it for more literal descriptions, raise it for hallucinations.

**Max Tokens:** Limits the length of the description (600 is usually a paragraph).

**Custom System Prompt:** Override the default behavior.

Default: "Creative Writer" persona (Flowery, descriptive, no lists).

Example Override: "You are a horror writer. Describe the tags in a terrifying way."

**Note:** The LLM automatically ignores/protects <lora:...> tags, so they won't be hallucinated away.

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
Note that LORAs may use either their internal filename or their actual filename.

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
2.5 Dimensional Temptation - Noa Base:
  Description:
    - Noa from the series '2.5 Dimensional Temptation' without a designated outfit
  Prompts:
    - '<lora:ILL CHAR 2.5 Dimensional Temptation GIRLPACK - Amano Lilisa, Tachibana Mikari, Noa, Kisaki Aria, 753, Makino:1> nonoa_def, Noa, blue eyes, black hair, short hair, sailor collar'
    - '<lora:ILL CHAR 2.5 Dimensional Temptation GIRLPACK - Amano Lilisa, Tachibana Mikari, Noa, Kisaki Aria, 753, Makino:1> nonoa_cos, Noa, blue eyes, blue hair, short hair, hair ornament'
  Tags:
    - 2.5 Dimensional Temptation
    - Noa
    - Human
    - White Skin
    - Lora
    - Girl Base
  Prefix:
    - 
  Suffix:
    - 
A-Rank Party - Silk Outfit:
  Description:
    - Silk from the series 'A-Rank Party' wearing her canonical outfits
  Prompts:
    - '<lora:ILL CHAR A-Rank Party - Silk:0.5> dark-skinned female, white hair, orange eyes, pointy ears, earrings, {swept bangs, french braid, long hair|high ponytail, swept bangs, long hair}, {SilkArcherOne, purple scarf, black jacket, long sleeves, black leotard, chest guard, red ribbon, leotard under clothes, underbust, highleg, white gloves, fur-trimmed shorts, white shorts, brown belt|SilkArcherTwo, beret, purple headwear, white ascot, cropped vest, white vest, sleeveless, elbow gloves, white gloves, vambraces, black leotard, leotard under clothes, highleg, fur-trimmed shorts, white shorts, red belt|SilkCasual, strapless, off-shoulder dress, frilled dress, purple dress, cleavage, long sleeves, light purple sleeves, pleated skirt, miniskirt, light pink skirt}'
  Tags:
    - A-Rank Party
    - Silk
    - Demihuman
    - Dark Skin
    - Colored Skin
    - Lora
    - Girl Outfit
  Prefix:
    - 
  Suffix:
    - 
```
**Usage:** Type `<` to select `<[Demihuman]>` and randomly choose a prompt between any of the YAML entries using `<[Demihuman]>` as a tag.

---

## 🚀 Example Workflows:

```text
// 1. COMPOUND VARIABLES
// We pack multiple "Keys" into one choice.
// Key 1: The visible text ("Fire").
// Key 2: The Logic Trigger for the LoRA ("**L1**").
// Key 3: The Logic Trigger for the Description ("**D1**").
$theme = {Fire **L1** **D1**|Ice **L2** **D2**}

$mood = {Happy|Angry}
@@width=768, height=768@@

// 2. MAIN PROMPT
(Masterpiece), <char:hatsune miku>, 
// $theme prints "Fire **L1** **D1**". 
// The "**...**" parts will be invisible in the final output.
$theme.clean theme. 

// 3. LOGIC (Using Unique Keys)
// Check L1 (Fire Lora) - It won't see D1, so no collision.
[if L1: <lora:fire_element_v1:0.8>]
[if L2: <lora:ice_concept:1.0>]

// Check D1 (Fire Desc) - It won't see L1.
[if D1: [if Happy: warm lighting | burning flames]]
[if D2: frozen crystal textures], 

highlighted in __2$$colors__.

// 4. ESCAPING
Artist signature: __#artist__

// 5. NEGATIVE PROMPT
**worst quality, lowres**
```

Here's a prompt I like to use all the time:

`$char1={__RandomGirls__}`

`$char2={__RandomGirls__}`

`$color1={__Colors__}`

`$color2={__Colors__}`

`$color3={__Colors__}`

`$color4={__Colors__}`

`A fullbody illustration of two girls standing together at a fashion show in the style of __ArtistNames__. $char1 is wearing __RandomOutfit__ with a primary color of $color1 and a secondary color of $color2. $char2 is wearing __RandomOutfit__ with a primary color of $color3 and a secondary color of $color4. {Both girls are __SharedPose__|The girls are holding hands and smiling while __MiscPose__}.`

`The background is __Background__.`

---

## 💬 Community & Support

Join the **Umi AI** Discord server to share workflows and get help!

👉 **[Join our Discord Server](https://discord.gg/9K7j7DTfG2)**
