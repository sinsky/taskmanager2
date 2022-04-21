import React, { useState, useEffect, useCallback, useRef, VFC } from "react";
import hljs from "highlight.js";
import mermaid from "mermaid";
import { marked } from "marked"; // eslint-disable-line no-unused-vars
import "highlight.js/styles/github.css";
import "github-markdown-css/github-markdown-light.css";

export const MarkdownComponent = ({ text }) => {
  const elmRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const elm = elmRef.current;
    if (!elm) return;
    elm.innerHTML = text === "" ? "" : marked.parse(text, {
      breaks: true,
      highlight: (code, lang) => {
        if (hljs.getLanguage(lang))
          return [
            `<code class="hljs">`,
            hljs.highlight(code, { language: lang }).value,
            `</code>`
          ].join("");
        if (lang === "mermaid")
          return [`<div class="mermaid">`, code, `</div>`].join("");
        return code;
      }
    });
    mermaid.init(".mermaid");
  }, [text]);
  return (
    <div>
      <div className="markdown-body" ref={elmRef} />
    </div>
  );
};
