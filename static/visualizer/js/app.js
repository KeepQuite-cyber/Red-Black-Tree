class RBNode {
    constructor(value, color = "RED", id = null) {
        this.value = value;
        this.color = color;
        this.left = null;
        this.right = null;
        this.parent = null;
        this.id = id ?? `node-${Math.random().toString(36).slice(2)}`;
    }
}

class RBTreeRecorder {
    constructor() {
        this.root = null;
        this.steps = [];
        this.currentInsert = null;
        this.serial = 0;
    }

    snapshot(meta = {}) {
        const serialize = (node) => {
            if (!node) return null;
            return {
                id: node.id,
                value: node.value,
                color: node.color,
                left: serialize(node.left),
                right: serialize(node.right),
            };
        };

        this.steps.push({
            tree: serialize(this.root),
            insertedValue: this.currentInsert,
            title: meta.title || "Tree updated",
            description: meta.description || "",
            action: meta.action || "Update",
            highlights: meta.highlights || {},
            validation: this.validate(),
        });
    }

    insert(value) {
        this.currentInsert = value;

        if (!this.root) {
            this.root = new RBNode(value, "BLACK", `n${++this.serial}`);
            this.snapshot({
                title: `Insert ${value} as root`,
                description: `${value} becomes the root. The root of a Red-Black Tree must always be black.`,
                action: "Insert root",
                highlights: { active: this.root.id }
            });
            return;
        }

        let parent = null;
        let cursor = this.root;

        while (cursor) {
            parent = cursor;

            this.snapshot({
                title: `Compare ${value} with ${cursor.value}`,
                description: value < cursor.value
                    ? `${value} is smaller than ${cursor.value}, so we move to the left subtree.`
                    : `${value} is greater than ${cursor.value}, so we move to the right subtree.`,
                action: "BST search",
                highlights: { active: cursor.id }
            });

            if (value === cursor.value) {
                this.snapshot({
                    title: `Skip duplicate ${value}`,
                    description: `This visualizer keeps unique values only, so duplicate ${value} is ignored.`,
                    action: "Duplicate",
                    highlights: { active: cursor.id }
                });
                return;
            }

            cursor = value < cursor.value ? cursor.left : cursor.right;
        }

        const node = new RBNode(value, "RED", `n${++this.serial}`);
        node.parent = parent;

        if (value < parent.value) parent.left = node;
        else parent.right = node;

        this.snapshot({
            title: `Insert ${value} as RED`,
            description: `${value} is inserted using normal BST ordering. New Red-Black Tree nodes begin red.`,
            action: "Insert",
            highlights: { active: node.id, parent: parent.id }
        });

        this.fixInsert(node);
        this.root.color = "BLACK";

        this.snapshot({
            title: `${value} insertion complete`,
            description: `All required Red-Black Tree properties are restored after inserting ${value}.`,
            action: "Complete",
            highlights: { active: node.id }
        });
    }

    fixInsert(node) {
        while (node !== this.root && node.parent && node.parent.color === "RED") {
            const parent = node.parent;
            const grand = parent.parent;

            if (!grand) break;

            this.snapshot({
                title: "Red-red violation detected",
                description: `${node.value} and its parent ${parent.value} are both red, so the tree must be repaired.`,
                action: "Violation",
                highlights: { active: node.id, parent: parent.id, grandparent: grand.id }
            });

            if (parent === grand.left) {
                let uncle = grand.right;

                this.snapshot({
                    title: `Inspect uncle of ${node.value}`,
                    description: uncle
                        ? `The uncle is ${uncle.value} and it is ${uncle.color.toLowerCase()}.`
                        : `The uncle is NIL, which is treated as black.`,
                    action: "Inspect",
                    highlights: {
                        active: node.id,
                        parent: parent.id,
                        grandparent: grand.id,
                        uncle: uncle ? uncle.id : null
                    }
                });

                if (uncle && uncle.color === "RED") {
                    parent.color = "BLACK";
                    uncle.color = "BLACK";
                    grand.color = "RED";

                    this.snapshot({
                        title: "Case 1: Recolor",
                        description: `Parent ${parent.value} and uncle ${uncle.value} become black. Grandparent ${grand.value} becomes red.`,
                        action: "Recolor",
                        highlights: {
                            active: node.id,
                            parent: parent.id,
                            uncle: uncle.id,
                            grandparent: grand.id
                        }
                    });

                    node = grand;
                } else {
                    if (node === parent.right) {
                        node = parent;
                        this.snapshot({
                            title: "Case 2: Left rotation preparation",
                            description: `The node forms a left-right triangle. Rotate left around ${node.value} to convert it into a straight line.`,
                            action: "Prepare rotation",
                            highlights: { active: node.id, grandparent: grand.id }
                        });
                        this.rotateLeft(node);

                        this.snapshot({
                            title: `Left rotate at ${node.value}`,
                            description: `The left rotation restructures the local subtree while preserving BST order.`,
                            action: "Left rotation",
                            highlights: { active: node.parent ? node.parent.id : null }
                        });
                    }

                    const p = node.parent;
                    const g = p ? p.parent : null;
                    if (!p || !g) break;

                    p.color = "BLACK";
                    g.color = "RED";

                    this.snapshot({
                        title: "Case 3: Recolor before rotation",
                        description: `Parent ${p.value} becomes black and grandparent ${g.value} becomes red.`,
                        action: "Recolor",
                        highlights: { active: node.id, parent: p.id, grandparent: g.id }
                    });

                    this.rotateRight(g);

                    this.snapshot({
                        title: `Right rotate at ${g.value}`,
                        description: `A right rotation restores balance and removes the red-red violation.`,
                        action: "Right rotation",
                        highlights: { active: p.id }
                    });
                }
            } else {
                let uncle = grand.left;

                this.snapshot({
                    title: `Inspect uncle of ${node.value}`,
                    description: uncle
                        ? `The uncle is ${uncle.value} and it is ${uncle.color.toLowerCase()}.`
                        : `The uncle is NIL, which is treated as black.`,
                    action: "Inspect",
                    highlights: {
                        active: node.id,
                        parent: parent.id,
                        grandparent: grand.id,
                        uncle: uncle ? uncle.id : null
                    }
                });

                if (uncle && uncle.color === "RED") {
                    parent.color = "BLACK";
                    uncle.color = "BLACK";
                    grand.color = "RED";

                    this.snapshot({
                        title: "Mirror Case 1: Recolor",
                        description: `Parent ${parent.value} and uncle ${uncle.value} become black. Grandparent ${grand.value} becomes red.`,
                        action: "Recolor",
                        highlights: {
                            active: node.id,
                            parent: parent.id,
                            uncle: uncle.id,
                            grandparent: grand.id
                        }
                    });

                    node = grand;
                } else {
                    if (node === parent.left) {
                        node = parent;
                        this.snapshot({
                            title: "Mirror Case 2: Right rotation preparation",
                            description: `The node forms a right-left triangle. Rotate right around ${node.value} first.`,
                            action: "Prepare rotation",
                            highlights: { active: node.id, grandparent: grand.id }
                        });
                        this.rotateRight(node);

                        this.snapshot({
                            title: `Right rotate at ${node.value}`,
                            description: `The right rotation converts the triangle into a straight line.`,
                            action: "Right rotation",
                            highlights: { active: node.parent ? node.parent.id : null }
                        });
                    }

                    const p = node.parent;
                    const g = p ? p.parent : null;
                    if (!p || !g) break;

                    p.color = "BLACK";
                    g.color = "RED";

                    this.snapshot({
                        title: "Mirror Case 3: Recolor before rotation",
                        description: `Parent ${p.value} becomes black and grandparent ${g.value} becomes red.`,
                        action: "Recolor",
                        highlights: { active: node.id, parent: p.id, grandparent: g.id }
                    });

                    this.rotateLeft(g);

                    this.snapshot({
                        title: `Left rotate at ${g.value}`,
                        description: `A left rotation restores the Red-Black Tree properties.`,
                        action: "Left rotation",
                        highlights: { active: p.id }
                    });
                }
            }
        }

        if (this.root && this.root.color !== "BLACK") {
            this.root.color = "BLACK";
            this.snapshot({
                title: "Force root to BLACK",
                description: `The root must always be black, so ${this.root.value} is recolored black.`,
                action: "Root recolor",
                highlights: { active: this.root.id }
            });
        }
    }

    rotateLeft(x) {
        const y = x.right;
        if (!y) return;

        x.right = y.left;
        if (y.left) y.left.parent = x;

        y.parent = x.parent;

        if (!x.parent) this.root = y;
        else if (x === x.parent.left) x.parent.left = y;
        else x.parent.right = y;

        y.left = x;
        x.parent = y;
    }

    rotateRight(y) {
        const x = y.left;
        if (!x) return;

        y.left = x.right;
        if (x.right) x.right.parent = y;

        x.parent = y.parent;

        if (!y.parent) this.root = x;
        else if (y === y.parent.left) y.parent.left = x;
        else y.parent.right = x;

        x.right = y;
        y.parent = x;
    }

    validate() {
        if (!this.root) {
            return {
                rootBlack: true,
                noRedRed: true,
                blackHeight: true,
                bst: true
            };
        }

        const rootBlack = this.root.color === "BLACK";

        const noRedRedCheck = (node) => {
            if (!node) return true;
            if (node.color === "RED") {
                if ((node.left && node.left.color === "RED") ||
                    (node.right && node.right.color === "RED")) {
                    return false;
                }
            }
            return noRedRedCheck(node.left) && noRedRedCheck(node.right);
        };

        const blackHeightCheck = (node) => {
            if (!node) return 1;
            const left = blackHeightCheck(node.left);
            const right = blackHeightCheck(node.right);
            if (left === false || right === false || left !== right) return false;
            return left + (node.color === "BLACK" ? 1 : 0);
        };

        const bstCheck = (node, min = -Infinity, max = Infinity) => {
            if (!node) return true;
            if (!(node.value > min && node.value < max)) return false;
            return bstCheck(node.left, min, node.value) &&
                   bstCheck(node.right, node.value, max);
        };

        return {
            rootBlack,
            noRedRed: noRedRedCheck(this.root),
            blackHeight: blackHeightCheck(this.root) !== false,
            bst: bstCheck(this.root)
        };
    }
}

class Visualizer {
    constructor() {
        this.svg = document.getElementById("treeSvg");
        this.viewport = document.getElementById("treeViewport");
        this.emptyState = document.getElementById("emptyState");
        this.input = document.getElementById("numbersInput");
        this.buildBtn = document.getElementById("buildBtn");
        this.randomBtn = document.getElementById("randomBtn");
        this.resetBtn = document.getElementById("resetBtn");
        this.prevBtn = document.getElementById("prevBtn");
        this.nextBtn = document.getElementById("nextBtn");
        this.playBtn = document.getElementById("playBtn");
        this.speedRange = document.getElementById("speedRange");
        this.speedLabel = document.getElementById("speedLabel");
        this.timeline = document.getElementById("timeline");
        this.eventCount = document.getElementById("eventCount");
        this.progressBar = document.getElementById("progressBar");
        this.currentStepLabel = document.getElementById("currentStepLabel");
        this.totalStepLabel = document.getElementById("totalStepLabel");
        this.stepTitle = document.getElementById("stepTitle");
        this.stepDescription = document.getElementById("stepDescription");
        this.insertedValue = document.getElementById("insertedValue");
        this.actionName = document.getElementById("actionName");
        this.statusPill = document.getElementById("statusPill");
        this.rulesList = document.getElementById("rulesList");

        this.steps = [];
        this.currentStep = -1;
        this.timer = null;
        this.nodePositions = new Map();

        this.bindEvents();
        this.updateSpeedLabel();
    }

    bindEvents() {
        this.buildBtn.addEventListener("click", () => this.build());
        this.randomBtn.addEventListener("click", () => this.randomize());
        this.resetBtn.addEventListener("click", () => this.reset());
        this.prevBtn.addEventListener("click", () => this.prev());
        this.nextBtn.addEventListener("click", () => this.next());
        this.playBtn.addEventListener("click", () => this.togglePlay());
        this.speedRange.addEventListener("input", () => {
            this.updateSpeedLabel();
            if (this.timer) {
                this.stop();
                this.play();
            }
        });

        this.input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") this.build();
        });
    }

    parseInput() {
        const raw = this.input.value.trim();
        if (!raw) return [];

        const values = raw
            .split(/[,\s]+/)
            .filter(Boolean)
            .map(Number);

        if (values.some(v => !Number.isFinite(v))) {
            throw new Error("Please enter only valid numbers separated by commas or spaces.");
        }

        if (values.length > 30) {
            throw new Error("Please use 30 numbers or fewer for a readable animation.");
        }

        return values;
    }

    build() {
        try {
            this.stop();
            const values = this.parseInput();

            if (!values.length) {
                this.toast("Enter at least one number.");
                return;
            }

            const recorder = new RBTreeRecorder();

            recorder.snapshot({
                title: "Start with an empty tree",
                description: "The Red-Black Tree is currently empty. We will insert the values one by one.",
                action: "Start"
            });

            values.forEach(v => recorder.insert(v));

            this.steps = recorder.steps;
            this.currentStep = 0;
            this.nodePositions.clear();
            this.emptyState.style.display = "none";

            this.renderTimeline();
            this.renderCurrentStep();
            this.statusPill.textContent = "Ready to animate";
        } catch (err) {
            this.toast(err.message);
        }
    }

    randomize() {
        const count = Math.floor(Math.random() * 5) + 7;
        const set = new Set();

        while (set.size < count) {
            set.add(Math.floor(Math.random() * 90) + 5);
        }

        this.input.value = [...set].join(", ");
        this.build();
    }

    reset() {
        this.stop();
        this.steps = [];
        this.currentStep = -1;
        this.nodePositions.clear();
        this.svg.innerHTML = "";
        this.emptyState.style.display = "flex";
        this.timeline.innerHTML = "";
        this.eventCount.textContent = "0";
        this.currentStepLabel.textContent = "0";
        this.totalStepLabel.textContent = "0";
        this.progressBar.style.width = "0%";
        this.stepTitle.textContent = "Waiting for input";
        this.stepDescription.textContent = "Build a tree to see every Red-Black Tree operation explained here.";
        this.insertedValue.textContent = "—";
        this.actionName.textContent = "Idle";
        this.statusPill.textContent = "Ready";
        this.setRules({rootBlack:true,noRedRed:true,blackHeight:true,bst:true});
    }

    prev() {
        if (!this.steps.length) return;
        this.stop();
        this.currentStep = Math.max(0, this.currentStep - 1);
        this.renderCurrentStep();
    }

    next() {
        if (!this.steps.length) return;
        this.currentStep = Math.min(this.steps.length - 1, this.currentStep + 1);
        this.renderCurrentStep();

        if (this.currentStep === this.steps.length - 1) this.stop();
    }

    togglePlay() {
        if (this.timer) this.stop();
        else this.play();
    }

    play() {
        if (!this.steps.length) {
            this.build();
            if (!this.steps.length) return;
        }

        if (this.currentStep >= this.steps.length - 1) {
            this.currentStep = 0;
            this.renderCurrentStep();
        }

        this.playBtn.textContent = "⏸";
        this.statusPill.textContent = "Playing";

        this.timer = setInterval(() => {
            if (this.currentStep >= this.steps.length - 1) {
                this.stop();
                this.statusPill.textContent = "Complete";
                return;
            }
            this.currentStep += 1;
            this.renderCurrentStep();
        }, Number(this.speedRange.value));
    }

    stop() {
        if (this.timer) clearInterval(this.timer);
        this.timer = null;
        this.playBtn.textContent = "▶";
        if (this.steps.length && this.currentStep < this.steps.length - 1) {
            this.statusPill.textContent = "Paused";
        }
    }

    updateSpeedLabel() {
        const base = 850;
        const speed = base / Number(this.speedRange.value);
        this.speedLabel.textContent = `${speed.toFixed(1)}×`;
    }

    renderTimeline() {
        this.timeline.innerHTML = "";
        this.eventCount.textContent = String(this.steps.length);

        this.steps.forEach((step, index) => {
            const item = document.createElement("div");
            item.className = "timeline-item";
            item.dataset.index = index;
            item.innerHTML = `
                <div class="timeline-index">${index}</div>
                <div class="timeline-copy">
                    <strong>${this.escape(step.action)}</strong>
                    <span>${this.escape(step.title)}</span>
                </div>
            `;
            item.addEventListener("click", () => {
                this.stop();
                this.currentStep = index;
                this.renderCurrentStep();
            });
            this.timeline.appendChild(item);
        });

        this.totalStepLabel.textContent = String(Math.max(0, this.steps.length - 1));
    }

    renderCurrentStep() {
        if (this.currentStep < 0 || !this.steps.length) return;

        const step = this.steps[this.currentStep];

        this.stepTitle.textContent = step.title;
        this.stepDescription.textContent = step.description;
        this.insertedValue.textContent = step.insertedValue ?? "—";
        this.actionName.textContent = step.action;
        this.currentStepLabel.textContent = String(this.currentStep);

        const denominator = Math.max(1, this.steps.length - 1);
        this.progressBar.style.width = `${(this.currentStep / denominator) * 100}%`;

        [...this.timeline.children].forEach((item, idx) => {
            item.classList.toggle("active", idx === this.currentStep);
        });

        const active = this.timeline.children[this.currentStep];
        if (active) active.scrollIntoView({block:"nearest", behavior:"smooth"});

        this.setRules(step.validation);
        this.drawTree(step.tree, step.highlights || {});
    }

    setRules(v) {
        const rules = [
            ["Root is black", v.rootBlack],
            ["No red node has a red child", v.noRedRed],
            ["Equal black-height paths", v.blackHeight],
            ["BST ordering is valid", v.bst]
        ];

        this.rulesList.innerHTML = rules.map(([label, ok]) => `
            <div class="rule ${ok ? "ok" : "bad"}">
                <span>${ok ? "✓" : "!"}</span>
                <p>${label}</p>
            </div>
        `).join("");
    }

    drawTree(root, highlights) {
        this.svg.innerHTML = "";
        if (!root) return;

        const width = Math.max(this.viewport.clientWidth, 850);
        const layout = this.computeLayout(root, width);
        const nextPositions = new Map();

        layout.nodes.forEach(n => nextPositions.set(n.id, {x:n.x, y:n.y}));

        layout.edges.forEach(edge => {
            const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
            line.setAttribute("class", "edge");

            const fromOld = this.nodePositions.get(edge.from.id) || {x:edge.from.x,y:edge.from.y};
            const toOld = this.nodePositions.get(edge.to.id) || {x:edge.from.x,y:edge.from.y};

            line.setAttribute("x1", fromOld.x);
            line.setAttribute("y1", fromOld.y);
            line.setAttribute("x2", toOld.x);
            line.setAttribute("y2", toOld.y);
            this.svg.appendChild(line);

            requestAnimationFrame(() => {
                line.setAttribute("x1", edge.from.x);
                line.setAttribute("y1", edge.from.y);
                line.setAttribute("x2", edge.to.x);
                line.setAttribute("y2", edge.to.y);
            });
        });

        layout.nodes.forEach(node => {
            const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
            group.setAttribute("class", "node-group");

            const old = this.nodePositions.get(node.id);
            group.setAttribute("transform", `translate(${old ? old.x : node.x},${old ? old.y : node.y})`);

            const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            let className = `node-circle ${node.color.toLowerCase()}`;

            if (highlights.active === node.id) className += " active";
            if (highlights.parent === node.id) className += " focus-parent";
            if (highlights.uncle === node.id) className += " focus-uncle";
            if (highlights.grandparent === node.id) className += " focus-grandparent";

            circle.setAttribute("class", className);
            circle.setAttribute("r", "25");
            circle.setAttribute("cx", "0");
            circle.setAttribute("cy", "0");

            if (!old) group.classList.add("node-pop");

            const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
            text.setAttribute("class", "node-text");
            text.setAttribute("x", "0");
            text.setAttribute("y", "1");
            text.textContent = node.value;

            group.appendChild(circle);
            group.appendChild(text);

            if (highlights.active === node.id) {
                const ring = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                ring.setAttribute("class", "flash-ring");
                ring.setAttribute("cx", "0");
                ring.setAttribute("cy", "0");
                ring.setAttribute("r", "31");
                group.appendChild(ring);
            }

            this.svg.appendChild(group);

            requestAnimationFrame(() => {
                group.setAttribute("transform", `translate(${node.x},${node.y})`);
            });
        });

        this.nodePositions = nextPositions;
    }

    computeLayout(root, width) {
        const nodes = [];
        const edges = [];
        const levels = new Map();

        const walk = (node, depth = 0, minX = 55, maxX = width - 55) => {
            if (!node) return;

            const x = (minX + maxX) / 2;
            const y = 70 + depth * 92;

            const entry = {...node, x, y};
            nodes.push(entry);
            levels.set(node.id, entry);

            if (node.left) {
                walk(node.left, depth + 1, minX, x - 12);
                edges.push({from: entry, to: levels.get(node.left.id)});
            }
            if (node.right) {
                walk(node.right, depth + 1, x + 12, maxX);
                edges.push({from: entry, to: levels.get(node.right.id)});
            }
        };

        walk(root);
        return {nodes, edges};
    }

    toast(message) {
        const old = document.querySelector(".toast");
        if (old) old.remove();

        const el = document.createElement("div");
        el.className = "toast";
        el.textContent = message;
        document.body.appendChild(el);

        setTimeout(() => el.remove(), 2600);
    }

    escape(str) {
        return String(str).replace(/[&<>"']/g, c => ({
            "&":"&amp;",
            "<":"&lt;",
            ">":"&gt;",
            '"':"&quot;",
            "'":"&#039;"
        }[c]));
    }
}

window.addEventListener("DOMContentLoaded", () => {
    const app = new Visualizer();
    app.build();
});
