import { app } from "../../scripts/app.js";

// =============================================================================
// PART 1: AUTOCOMPLETE LOGIC
// =============================================================================

class AutoCompletePopup {
    constructor() {
        this.element = document.createElement("div");
        Object.assign(this.element.style, {
            position: "absolute",
            display: "none",
            backgroundColor: "#1e1e1e",
            border: "1px solid #444",
            zIndex: "9999",
            maxHeight: "250px",
            overflowY: "auto",
            color: "#e0e0e0",
            fontFamily: "'Consolas', 'Monaco', monospace",
            fontSize: "13px",
            borderRadius: "6px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
            minWidth: "200px"
        });
        document.body.appendChild(this.element);
        this.visible = false;
    }

    show(x, y, options, onSelect) {
        this.element.innerHTML = "";
        this.element.style.left = x + "px";
        this.element.style.top = y + "px";
        this.element.style.display = "block";
        this.visible = true;

        if (options.length === 0) {
            this.hide();
            return;
        }

        const header = document.createElement("div");
        header.style.padding = "4px 8px";
        header.style.fontSize = "11px";
        header.style.color = "#888";
        header.style.borderBottom = "1px solid #333";
        header.style.backgroundColor = "#252525";
        header.innerText = options.length > 50 ? `Showing 50 of ${options.length} matches...` : "Suggestions";
        this.element.appendChild(header);

        options.slice(0, 50).forEach(opt => {
            const div = document.createElement("div");
            div.innerText = opt;
            div.style.cursor = "pointer";
            div.style.padding = "6px 10px";
            div.style.borderBottom = "1px solid #2a2a2a";
            div.style.transition = "background 0.1s";
            
            div.onmouseover = () => div.style.backgroundColor = "#2d4f6c"; 
            div.onmouseout = () => div.style.backgroundColor = "transparent";
            
            div.onmousedown = (e) => {
                e.preventDefault(); 
                onSelect(opt);
                this.hide();
            };
            this.element.appendChild(div);
        });
    }

    hide() {
        this.element.style.display = "none";
        this.visible = false;
    }
}

// =============================================================================
// PART 2: THE USER GUIDE (UPDATED WITH ORDER OF OPERATIONS)
// =============================================================================

const HELP_STYLES = `
    .umi-help-modal {
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        background: rgba(0,0,0,0.85); z-index: 10000;
        display: flex; justify-content: center; align-items: center;
        backdrop-filter: blur(8px); font-family: "Segoe UI", Roboto, Helvetica, sans-serif;
    }
    .umi-help-content {
        background: #181818; width: 1100px; max-width: 95%; height: 90%;
        border-radius: 12px; box-shadow: 0 0 60px rgba(0,0,0,0.9);
        border: 1px solid #333; display: flex; flex-direction: column; overflow: hidden;
    }
    .umi-help-header {
        background: #202020; padding: 20px 40px; border-bottom: 1px solid #333;
        display: flex; justify-content: space-between; align-items: center; flex-shrink: 0;
    }
    .umi-help-header h2 { margin: 0; color: #fff; font-size: 24px; font-weight: 300; letter-spacing: 1px; }
    .umi-help-close {
        background: #a93333; color: white; border: none; padding: 8px 20px;
        border-radius: 4px; cursor: pointer; font-weight: bold; transition: 0.2s;
    }
    .umi-help-close:hover { background: #d44; }
    .umi-help-body {
        padding: 40px; overflow-y: auto; color: #ccc; line-height: 1.7;
        scrollbar-width: thin; scrollbar-color: #444 #181818;
    }
    .umi-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
    .umi-full { grid-column: 1 / -1; margin-bottom: 40px; }
    h3 { color: #61afef; border-bottom: 2px solid #333; padding-bottom: 10px; margin-top: 0; font-size: 18px; }
    h4 { color: #e5c07b; margin-bottom: 5px; margin-top: 20px; font-size: 15px; }
    p { margin-top: 0; font-size: 14px; }
    .umi-code { background: #111; padding: 2px 6px; border-radius: 4px; font-family: "Consolas", monospace; color: #98c379; border: 1px solid #333; font-size: 0.9em; }
    .umi-block { background: #111; padding: 15px; border-radius: 6px; font-family: "Consolas", monospace; color: #abb2bf; border-left: 4px solid #61afef; margin: 10px 0; white-space: pre-wrap; font-size: 12px; overflow-x: auto; }
    .umi-table { width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 15px; }
    .umi-table th { text-align: left; border-bottom: 2px solid #444; padding: 8px; color: #fff; }
    .umi-table td { border-bottom: 1px solid #333; padding: 8px; color: #bbb; }
    .umi-note { background: #252518; color: #d19a66; padding: 15px; border-radius: 6px; margin-top: 15px; border: 1px solid #443322; font-size: 13px; }
    .umi-warning { background: #251818; color: #e06c75; padding: 15px; border-radius: 6px; margin-top: 15px; border: 1px solid #552222; font-size: 13px; }
    .umi-wiring { background: #1a251a; color: #98c379; padding: 20px; border-radius: 6px; border: 1px solid #2d442d; }
    details { background: #222; border-radius: 6px; padding: 10px; margin-bottom: 10px; border: 1px solid #333; }
    details[open] { background: #222; }
    summary { cursor: pointer; font-weight: bold; color: #e0e0e0; outline: none; list-style: none; }
    summary::after { content: "+"; float: right; font-weight: bold; color: #61afef; }
    details[open] summary::after { content: "-"; }
    details p { padding: 10px 0 0 0; color: #aaa; }
`;

const HELP_HTML = `
    <div class="umi-full">
        <h3>🔌 Wiring & Installation (Read First)</h3>
        <div class="umi-wiring">
            <p><strong>1. Basic Connections:</strong> Connect <code>text</code> output to CLIP Positive, and <code>negative_text</code> output to CLIP Negative.</p>
            <div style="height: 10px;"></div>
            <p><strong>2. Resolution Control (Crucial):</strong> To let this node control image size (e.g. <code>@@width=1024@@</code>), you must enable inputs on your Latent node:</p>
            <ul style="margin: 5px 0 0 0; font-size: 13px;">
                <li>Right-Click your <strong>Empty Latent Image</strong> node.</li>
                <li>Select <strong>Convert width to input</strong> and <strong>Convert height to input</strong>.</li>
                <li>Connect the UmiAI <code>width</code> and <code>height</code> outputs to these new inputs.</li>
            </ul>
        </div>
        
        <div class="umi-warning">
            <strong>⚠️ IMPORTANT: Batch Size vs. Queue</strong><br>
            If you set "Batch Size" to 4 on your Empty Latent node, you will get 4 <strong>identical</strong> images.
            To generate 4 <strong>different</strong> variations (or cycle through Sequential logic), leave Batch Size at 1 and use the <strong>"Queue Batch"</strong> setting in the ComfyUI menu instead.
        </div>
    </div>

    <div class="umi-full">
        <h3>🎨 6. Danbooru Character Expander</h3>
        <p>Automatically fetch visual descriptions (hair color, outfit, eyes) from Danbooru for specific characters.</p>
        
        <div class="umi-block">// Syntax
char:character_name
// OR
&lt;char:character_name&gt;

// Example
(Masterpiece), A photo of char:frieren.</div>

        <div class="umi-note">
            <strong>⚙️ Usage Tips:</strong>
            <ul style="margin: 5px 0 0 0; padding-left: 20px;">
                <li><strong>Threshold (Slider):</strong> Controls how common a tag must be to appear. 
                    <br> - <strong>High (0.8+):</strong> Only core features (e.g., hair color).
                    <br> - <strong>Low (0.2-0.4):</strong> Includes outfits and minor details. If a character looks "generic", <strong>lower this value!</strong>
                </li>
                <li><strong>AutoRefresh:</strong> Set to "Yes" to force a fresh fetch from Danbooru (bypassing the cache).</li>
                <li><strong>All Ratings:</strong> The node scans ALL images (Safe, Questionable, Explicit) to ensure accurate tags for all characters.</li>
            </ul>
        </div>
    </div>

    <div class="umi-grid">
        <div>
            <h3>🎲 1. Randomization & Probability</h3>
            <table class="umi-table">
                <tr><th>Syntax</th><th>Function</th></tr>
                <tr><td><span class="umi-code">{a|b}</span></td><td>Standard choice.</td></tr>
                <tr><td><span class="umi-code">{2$$a|b|c}</span></td><td>Pick exactly 2 unique items.</td></tr>
                <tr><td><span class="umi-code">{1-3$$a|b|c}</span></td><td>Pick 1 to 3 items randomly.</td></tr>
                <tr><td><span class="umi-code">{50%a|b}</span></td><td>50% chance of 'a', else 'b'.</td></tr>
                <tr><td><span class="umi-code">{30%a}</span></td><td>30% chance of 'a', else nothing.</td></tr>
                <tr><td><span class="umi-code">{~a|b|c}</span></td><td><strong>Sequential:</strong> Cycles 1 by 1 based on Seed.</td></tr>
            </table>

            <details>
                <summary>💡 Examples & Tips (Weighted Choices)</summary>
                <p><strong>Method A (Repetition):</strong><br>
                To make 'Gold' appear more often than 'Silver', simply repeat it:<br>
                <code>{Gold|Gold|Gold|Silver}</code> (75% Gold).</p>
                
                <p><strong>Method B (Percentage):</strong><br>
                For cleaner code, use the percentage syntax:<br>
                <code>{75%Gold|Silver}</code></p>
                
                <p><strong>The "Chaos" Generator:</strong><br>
                Pick a random amount of modifiers:<br>
                <code>{0-5$$fire|ice|wind|earth|void|light}</code></p>
            </details>
        </div>

        <div>
            <h3>📂 2. Wildcards (Files)</h3>
            <p>Load data from <code>/wildcards</code> folder. Supports txt and yaml.</p>
            <table class="umi-table">
                <tr><th>Syntax</th><th>Function</th></tr>
                <tr><td><span class="umi-code">__file__</span></td><td>Random line from file.txt</td></tr>
                <tr><td><span class="umi-code">&lt;[tag]&gt;</span></td><td>YAML item containing this tag.</td></tr>
                <tr><td><span class="umi-code">&lt;[t1][t2]&gt;</span></td><td>AND: Must have both tags.</td></tr>
                <tr><td><span class="umi-code">&lt;[t1|t2]&gt;</span></td><td>OR: Can have either tag.</td></tr>
                <tr><td><span class="umi-code">&lt;[--t1]&gt;</span></td><td>NOT: Must NOT have tag.</td></tr>
            </table>

            <details>
                <summary>💡 The Autocomplete System</summary>
                <p><strong>Files:</strong> Type <code>__</code> in the box to see a dropdown of all text files.</p>
                <p><strong>Tags:</strong> Type <code>&lt;</code> in the box to see a dropdown of all tags found inside your YAML files.</p>
                <p><strong>Deep Paths:</strong> You can use subfolders. <code>__styles/anime/90s__</code> works perfectly.</p>
            </details>
        </div>
    </div>

    <div class="umi-full">
        <h3>💾 3. Variables & Filters</h3>
        <p>Define a choice once, store it, and reuse it. Use dot notation to filter the output.</p>
        
        <div class="umi-block">// 1. Assignment
$location={Neon_City|Dark_Alley}

// 2. Usage with Filters
A photo of $location.clean.upper.
// Output: "A photo of NEON CITY."</div>

        <table class="umi-table">
            <tr><th>Filter</th><th>Description</th></tr>
            <tr><td><span class="umi-code">.clean</span></td><td>Replaces <code>_</code> and <code>-</code> with spaces.</td></tr>
            <tr><td><span class="umi-code">.upper</span></td><td>CONVERTS TO ALL CAPS.</td></tr>
            <tr><td><span class="umi-code">.title</span></td><td>Capitalizes First Letters.</td></tr>
        </table>
    </div>

    <div class="umi-grid">
        <div>
            <h3>🔀 4. Conditional Logic</h3>
            <p>Inject text only if a keyword exists in the resolved prompt.</p>
            <div class="umi-block">[if Keyword : True Text | False Text]</div>
            
            <div class="umi-warning">
                <strong>⚠️ ORDER OF OPERATIONS (CRITICAL)</strong><br>
                Variables are replaced <strong>BEFORE</strong> Logic runs. Logic scans the final text.<br><br>
                
                <strong>Example:</strong> <code>$loc={Neon_City}</code><br>
                If prompt is: <code>$loc.clean</code> (Output: "Neon City")<br>
                
                ❌ <code>[if Neon_City: ...]</code> will FAIL (underscore gone).<br>
                ✅ <code>[if Neon City: ...]</code> will WORK.
            </div>

            <details>
                <summary>💡 Pro Tip: The "Hidden State" Trick</summary>
                <p>If you want to use Filters like <code>.clean</code> but keep your Logic simple (checking for underscores), hide the raw variable in the Negative Prompt!</p>
                <div class="umi-block">$loc={Neon_City}
A photo of $loc.clean.
[if Neon_City: Cyberpunk] 
**$loc**</div>
                <p>The logic finds <code>$loc</code> (Neon_City) in the negatives before it gets stripped out!</p>
            </details>
        </div>

        <div>
            <h3>⚙️ 5. Settings & Utility</h3>
            <p>Control the workflow from the text box.</p>
            
            <h4>Resolution Override</h4>
            <div class="umi-block">@@width=1024, height=1536@@</div>
            <p>Sets the width/height outputs. Can be placed inside conditionals to change size per-subject.</p>

            <h4>Inline Negatives</h4>
            <div class="umi-block">A pretty landscape **watermark, text**</div>
            <p>Removes text between <code>**</code> and sends it to the Negative Output.</p>
        </div>
    </div>

    <div class="umi-full">
        <h3>🚀 Advanced Usage Examples</h3>
        <p>Copy-paste these blocks to test advanced functionality.</p>
        
        <details>
            <summary>🧪 1. Context-Aware Character (Variables + Logic)</summary>
            <div class="umi-block">$genre={High Fantasy|Cyberpunk|Post-Apocalyptic}
$view={~Portrait|Landscape}

// Logic: Set resolution based on View
[if Portrait: @@width=1024, height=1536@@][if Landscape: @@width=1536, height=1024@@]

(Masterpiece), A $view of a warrior, female.
She is wearing [if Fantasy: plate armor][if Cyberpunk: tech jacket][if Post-Apocalyptic: rags].
She is holding [if Fantasy: a sword | [if Cyberpunk: a pistol | a crowbar]].

The background is a $genre landscape.
**watermark, text, blurry, nsfw**</div>
        </details>

        <details>
            <summary>📸 2. The "Ultimate Portrait Studio" (Camera Logic)</summary>
            <div class="umi-block">$theme={Cyberpunk|High Fantasy|Modern Editorial}
$subject_gender={female|male}

// Resolution & Camera Logic
[if Cyberpunk: @@width=896, height=1152@@ (Shot on Phase One XF IQ4:1.2), 150MP, razor sharp focus, digital sensor]
[if High Fantasy: @@width=1024, height=1280@@ (Shot on Kodak Portra 400:1.2), 35mm film grain, analog aesthetic]
[if Modern Editorial: @@width=1024, height=1024@@ (Shot on Canon EOS R5:1.2), 85mm portrait lens, f/1.8, bokeh]

(Masterpiece, best quality, 8k), A breathtaking portrait of a $theme $subject_gender.
Wearing [if Cyberpunk: holographic jacket][if Fantasy: elven armor][if Modern: haute couture].

**cartoon, anime, 3d render, watermark**</div>
        </details>
    </div>
`;

function showHelpModal() {
    if (!document.getElementById("umi-help-style")) {
        const style = document.createElement("style");
        style.id = "umi-help-style";
        style.innerHTML = HELP_STYLES;
        document.head.appendChild(style);
    }

    const modal = document.createElement("div");
    modal.className = "umi-help-modal";
    modal.onclick = (e) => { if(e.target === modal) modal.remove(); };

    modal.innerHTML = `
        <div class="umi-help-content">
            <div class="umi-help-header">
                <h2>📘 UmiAI Reference Manual</h2>
                <button class="umi-help-close" onclick="this.closest('.umi-help-modal').remove()">CLOSE</button>
            </div>
            <div class="umi-help-body">
                ${HELP_HTML}
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// =============================================================================
// PART 3: REGISTRATION
// =============================================================================

app.registerExtension({
    name: "UmiAI.WildcardSystem",
    async setup() {
        const resp = await fetch("/umi/wildcards");
        this.data = await resp.json();
        this.popup = new AutoCompletePopup();
    },

    async beforeRegisterNodeDef(nodeType, nodeData, app) {
        if (nodeData.name !== "UmiAIWildcardNode") return;

        const getExtraMenuOptions = nodeType.prototype.getExtraMenuOptions;
        nodeType.prototype.getExtraMenuOptions = function(_, options) {
            if (getExtraMenuOptions) getExtraMenuOptions.apply(this, arguments);
            options.push(null);
            options.push({
                content: "📘 Open UmiAI User Guide",
                callback: () => { showHelpModal(); }
            });
        }

        const onNodeCreated = nodeType.prototype.onNodeCreated;
        nodeType.prototype.onNodeCreated = function () {
            if (onNodeCreated) onNodeCreated.apply(this, arguments);

            const textWidget = this.widgets.find(w => w.name === "text");
            if (!textWidget || !textWidget.inputEl) return;

            textWidget.inputEl.addEventListener("keyup", (e) => {
                const cursor = textWidget.inputEl.selectionStart;
                const text = textWidget.inputEl.value;
                const beforeCursor = text.substring(0, cursor);

                const matchFile = beforeCursor.match(/__([\w\/\-]*)$/);
                const matchTag = beforeCursor.match(/<([a-zA-Z0-9_\-\s]*)$/);

                const ext = app.extensions.find(e => e.name === "UmiAI.WildcardSystem");
                if (!ext || !ext.data) return;

                let options = [];
                let triggerType = ""; 
                let matchIndex = 0;
                let query = "";

                if (matchFile) {
                    triggerType = "file";
                    query = matchFile[1].toLowerCase();
                    matchIndex = matchFile.index;
                    options = ext.data.files.filter(w => w.toLowerCase().includes(query));
                } else if (matchTag) {
                    triggerType = "tag";
                    query = matchTag[1].toLowerCase();
                    matchIndex = matchTag.index;
                    options = ext.data.tags.filter(t => t.toLowerCase().includes(query));
                }

                if (triggerType && options.length > 0) {
                    const rect = textWidget.inputEl.getBoundingClientRect();
                    const topOffset = rect.top + 20 + (rect.height / 2); 
                    
                    ext.popup.show(rect.left + 20, topOffset, options, (selected) => {
                        let completion = "";
                        if (triggerType === "file") completion = `__${selected}__`;
                        else completion = `<[${selected}]>`; 

                        const prefix = text.substring(0, matchIndex);
                        const suffix = text.substring(cursor);
                        textWidget.inputEl.value = prefix + completion + suffix;
                        if(textWidget.callback) textWidget.callback(textWidget.inputEl.value);
                        
                        const newCursorPos = (prefix + completion).length;
                        textWidget.inputEl.setSelectionRange(newCursorPos, newCursorPos);
                        textWidget.inputEl.focus();
                    });
                } else {
                    ext.popup.hide();
                }
            });

            document.addEventListener("mousedown", (e) => {
                const ext = app.extensions.find(e => e.name === "UmiAI.WildcardSystem");
                if (ext && ext.popup && e.target !== ext.popup.element && !ext.popup.element.contains(e.target) && e.target !== textWidget.inputEl) {
                    ext.popup.hide();
                }
            });
        };
    }
});