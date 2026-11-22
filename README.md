# 🔐 RSA Quest

> **✦ Pixel Crypto Simulator ✦** — *Encrypt your secrets, char by char.*

**RSA Quest** is a retro, CRT-styled pixel-art web simulator that makes learning RSA public-key cryptography interactive and visual. Guided by an animated inline-SVG cyber-cat, users complete a 3-level quest to generate prime-based keys, encrypt plaintext messages character-by-character via ASCII codes, and decrypt ciphertext back into readable text.

---

## ✨ Features

* **Level 1 — Key Generation (`KEYS`):**
  * Pick two distinct prime numbers (p and q, ranging from `11` to `61`) and dynamically populates up to 16 valid public exponents (e) coprime to φ(n).
  * Enforces cryptographic constraints (p ≠ q and n > 126 so every printable ASCII character fits without modular wrap-around).
  * Renders distinct **Public Key** (e, n) and **Private Key** (d, n) cards alongside a 5-step mathematical walkthrough.
* **Level 2 — Message Encryption (`LOCK`):**
  * Encrypts plaintext messages (up to 30 characters) character by character using \(c = m^e \bmod n\).
  * Generates a character-by-character breakdown table (`char` → `ascii` → `encrypted`) and automatically forwards the comma-separated ciphertext to the **UNLOCK** tab.
* **Level 3 — Message Decryption (`UNLOCK`):**
  * Validates comma-separated ciphertext numbers and restores the original message using \(m = c^d \bmod n\).
  * Displays a reverse lookup table (`cipher` → `ascii` → `char`) and walks through Euler's theorem behind the decryption.
* **Retro Arcade Experience:**
  * Dark CRT monitor aesthetic with scanline overlays, a 20px pixel-grid background, floating ambient emojis, and responsive mobile-friendly grids.
  * Persistent Key HUD across tabs displaying active (e, n) and (d, n) values, plus a 3-star quest progress tracker that lights up as each level is cleared.
  * Zero external JS libraries—uses native JavaScript `BigInt` for overflow-safe modular exponentiation.

---

## 🛠️ Tech Stack

* **HTML5** — Semantic 3-panel tab architecture & custom inline SVG pixel-cat mascot
* **CSS3** — Custom CSS variables, CRT scanline overlay (`::after`), keyframe animations (`floatUp`, `catBob`, `starPop`), and responsive CSS Grid layouts (`style.css`)
* **Vanilla JavaScript (ES6+)** — `BigInt` binary modular exponentiation, Extended Euclidean algorithm, input validation, and DOM state management
* **Google Fonts** — `Press Start 2P` (retro headers/UI) and `VT323` (monospace inputs/readouts)

---

## 📂 Project Structure

```text
rsa-quest/
├── index.html      # Main UI, inline SVG pixel-cat mascot, and 3-level quest panels
├── style.css       # Retro CRT theme, custom properties, scanlines, and animations
├── script.js       # RSA math engine, validation guards, and UI state logic
└── README.md       # Project documentation
```

---

## 🚀 Getting Started

**RSA Quest** is a dependency-free static web app—no build tools or package installations are required.

1. **Clone the repository:**
   ```bash
   git clone https://github.com
   cd rsa-quest
   ```
2. **Launch the app:**
   * Open `index.html` directly in any modern browser, **or**
   * Start a local server (e.g., with Python):
     ```bash
     python -m http.server 8000
     ```
     Then visit `http://localhost:8000`.

---

## 🧮 Under the Hood

The cryptography engine (`script.js`) implements textbook RSA from scratch:

| Function | Purpose | Algorithm / Formula |
| :--- | :--- | :--- |
| `gcd(a, b)` | Verifies $\gcd(e, \varphi(n)) = 1$ | Euclidean algorithm |
| `modInverse(a, m)` | Computes private exponent $d$ | Extended Euclidean algorithm: $(d \times e) \equiv 1 \pmod{\varphi(n)}$ |
| `modpow(base, exp, mod)` | Computes $m^e \bmod n$ and $c^d \bmod n$ | Right-to-left binary exponentiation using `BigInt` |
| `computeKeys()` | Validates $p \neq q$ and $n > 126$, computes $n, \varphi(n), d$ | $n = p \times q$, $\varphi(n) = (p - 1)(q - 1)$ |

> ⚠️ **Educational Disclaimer:** This simulator uses small primes ($11$–$61$) and unpadded character-by-character encryption so learners can inspect the math visually. Do not use it to secure real-world sensitive data.

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
