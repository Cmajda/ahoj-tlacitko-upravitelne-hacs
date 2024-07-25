class AhojTlacitkoUpravitelneHacs extends HTMLElement {
  private _config: any;
  private _hass: any;
  private _elements: {
    card?: HTMLElement;
    style?: HTMLStyleElement;
    error?: HTMLElement;
    dl?: HTMLElement;
    topic?: HTMLElement;
    toggle?: HTMLElement;
    value?: HTMLElement;
  } = {}; // Define initial type of _elements

  constructor() {
    super();
    this.doCard();
    this.doStyle();
    this.doAttach();
    this.doQueryElements();
    this.doListen();
  }

  setConfig(config: any) {
    this._config = config;
    this.doCheckConfig();
    this.doUpdateConfig();
  }

  set hass(hass: any) {
    this._hass = hass;
    this.doUpdateHass();
  }

  onClicked() {
    this.doToggle();
  }

  // Accessors
  isOff() {
    return this.getState().state === "off";
  }

  isOn() {
    return this.getState().state === "on";
  }

  getHeader() {
    return this._config.header;
  }

  getEntityID() {
    return this._config.entity;
  }

  getState() {
    return this._hass.states[this.getEntityID()];
  }

  getAttributes() {
    return this.getState().attributes;
  }

  getName() {
    const friendlyName = this.getAttributes().friendly_name;
    return friendlyName ? friendlyName : this.getEntityID();
  }

  // Jobs
  doCheckConfig() {
    if (!this._config.entity) {
      throw new Error("Please define an entity!");
    }
  }

  doCard() {
    this._elements.card = document.createElement("ha-card");
    this._elements.card.innerHTML = `
      <div class="card-content">
        <p class="error error--hidden"></p>
        <dl class="dl">
          <dt class="dt"></dt>
          <dd class="dd">
            <span class="toggle">
              <span class="button"></span>
            </span>
            <span class="value"></span>
          </dd>
        </dl>
      </div>
    `;
  }

  doStyle() {
    const style = document.createElement("style") as HTMLStyleElement;
    style.textContent = `
      .error { color: red; }
      .error--hidden { display: none; }
      .dl {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
      .dl--hidden { display: none; }
      .dt {
        display: flex;
        align-content: center;
        flex-wrap: wrap;
      }
      .dd {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, auto) minmax(0, 2fr));
        margin: 0;
      }
      .toggle {
        padding: 0.6em;
        border: grey;
        border-radius: 50%;
      }
      .toggle--on { background-color: green; }
      .toggle--off { background-color: red; }
      .button {
        display: block;
        border: outset 0.2em;
        border-radius: 50%;
        border-color: silver;
        background-color: silver;
        width: 1.4em;
        height: 1.4em;
      }
      .value {
        padding-left: 0.5em;
        display: flex;
        align-content: center;
        flex-wrap: wrap;
      }
    `;
    this._elements.style = style; // Ensure correct type assignment
  }

  doAttach() {
    this.attachShadow({ mode: "open" });
    if (this._elements.style) {
      this.shadowRoot!.append(this._elements.style);
    }
    if (this._elements.card) {
      this.shadowRoot!.append(this._elements.card);
    }
  }

  doQueryElements() {
    const card = this._elements.card as HTMLElement;
    this._elements.error = card.querySelector(".error") as HTMLElement;
    this._elements.dl = card.querySelector(".dl") as HTMLElement;
    this._elements.topic = card.querySelector(".dt") as HTMLElement;
    this._elements.toggle = card.querySelector(".toggle") as HTMLElement;
    this._elements.value = card.querySelector(".value") as HTMLElement;
  }

  doListen() {
    const dl = this._elements.dl as HTMLElement;
    if (dl) {
      dl.addEventListener(
        "click",
        this.onClicked.bind(this),
        false
      );
    }
  }

  doUpdateConfig() {
    const card = this._elements.card as HTMLElement;
    if (this.getHeader()) {
      card.setAttribute("header", this.getHeader());
    } else {
      card.removeAttribute("header");
    }
  }

  doUpdateHass() {
    const errorElement = this._elements.error as HTMLElement;
    const dlElement = this._elements.dl as HTMLElement;

    if (!this.getState()) {
      if (errorElement) {
        errorElement.textContent = `${this.getEntityID()} is unavailable.`;
        errorElement.classList.remove("error--hidden");
      }
      if (dlElement) {
        dlElement.classList.add("dl--hidden");
      }
    } else {
      if (errorElement) {
        errorElement.textContent = "";
        errorElement.classList.add("error--hidden");
      }
      if (this._elements.topic) {
        (this._elements.topic as HTMLElement).textContent = this.getName();
      }
      if (this._elements.toggle) {
        const toggle = this._elements.toggle as HTMLElement;
        if (this.isOff()) {
          toggle.classList.remove("toggle--on");
          toggle.classList.add("toggle--off");
        } else if (this.isOn()) {
          toggle.classList.remove("toggle--off");
          toggle.classList.add("toggle--on");
        }
      }
      if (this._elements.value) {
        (this._elements.value as HTMLElement).textContent = this.getState().state;
      }
      if (dlElement) {
        dlElement.classList.remove("dl--hidden");
      }
    }
  }

  doToggle() {
    this._hass.callService("input_boolean", "toggle", {
      entity_id: this.getEntityID(),
    });
  }

  // Card configuration
  static getConfigElement() {
    return document.createElement("ahoj-tlacitko-upravitelne-hacs-editor");
  }

  static getStubConfig() {
    return {
      entity: "input_boolean.twgc",
      header: "",
    };
  }
}

class AhojTlacitkoUpravitelneHacsEditor extends HTMLElement {
  private _config: any;
  private _hass: any;
  private _elements: {
    header?: HTMLInputElement;
    entity?: HTMLInputElement;
    style?: HTMLStyleElement;
  } = {}; // Define initial type of _elements
  private _editor: HTMLFormElement;

  constructor() {
    super();
    console.log("editor:constructor()");
    this._editor = document.createElement("form") as HTMLFormElement;
    this.doEditor();
    this.doStyle();
    this.doAttach();
    this.doQueryElements();
    this.doListen();
  }

  setConfig(config: any) {
    console.log("editor:setConfig()");
    this._config = config;
    this.doUpdateConfig();
  }

  set hass(hass: any) {
    console.log("editor.hass()");
    this._hass = hass;
    this.doUpdateHass();
  }

  onChanged(event: Event) {
    console.log("editor.onChanged()");
    this.doMessageForUpdate(event);
  }

  // Jobs
  doEditor() {
    this._editor.innerHTML = `
      <div class="row">
        <label class="label" for="header">Header:</label>
        <input class="value" id="header"></input>
      </div>
      <div class="row">
        <label class="label" for="entity">Entity:</label>
        <input class="value" id="entity"></input>
      </div>
    `;
  }

  doStyle() {
    const style = document.createElement("style") as HTMLStyleElement;
    style.textContent = `
      form {
        display: table;
      }
      .row {
        display: table-row;
      }
      .label, .value {
        display: table-cell;
        padding: 0.5em;
      }
    `;
    this._elements.style = style; // Ensure correct type assignment
  }

  doAttach() {
    this.attachShadow({ mode: "open" });
    if (this._elements.style) {
      this.shadowRoot!.append(this._elements.style);
    }
    this.shadowRoot!.append(this._editor);
  }

  doQueryElements() {
    this._elements.header = this._editor.querySelector("#header") as HTMLInputElement;
    this._elements.entity = this._editor.querySelector("#entity") as HTMLInputElement;
  }

  doListen() {
    if (this._elements.header) {
      this._elements.header.addEventListener(
        "focusout",
        this.onChanged.bind(this)
      );
    }
    if (this._elements.entity) {
      this._elements.entity.addEventListener(
        "focusout",
        this.onChanged.bind(this)
      );
    }
  }

  doUpdateConfig() {
    if (this._elements.header) {
      this._elements.header.value = this._config.header;
    }
    if (this._elements.entity) {
      this._elements.entity.value = this._config.entity;
    }
  }

  doUpdateHass() {}

  doMessageForUpdate(changedEvent: Event) {
    const target = changedEvent.target as HTMLInputElement;
    // This _config is readonly, so we need to copy it
    const newConfig = { ...this._config };
    if (target.id === "header") {
      newConfig.header = target.value;
    } else if (target.id === "entity") {
      newConfig.entity = target.value;
    }
    const messageEvent = new CustomEvent("config-changed", {
      detail: { config: newConfig },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(messageEvent);
  }
}


customElements.define("ahoj-tlacitko-upravitelne-hacs", AhojTlacitkoUpravitelneHacs);
customElements.define("ahoj-tlacitko-upravitelne-hacs-editor", AhojTlacitkoUpravitelneHacsEditor);

// Ensure customCards exists
(window as any).customCards = (window as any).customCards || [];
(window as any).customCards.push({
  type: "ahoj-tlacitko-upravitelne-hacs",
  name: "Ahoj tlačítko editor",
  description: "Turn an entity on and off",
});
