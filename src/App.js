import React, { useEffect, useState, useRef } from "react";
import { GrokCollection } from "grok-js";
import { Navbar } from "./components/Navbar";
import { UnControlled as CodeMirrorTextarea } from "react-codemirror2";
import { Book, Copy, Share2, Trash2, Check, PlusSquare, DownloadCloud, ExternalLink } from "react-feather";
import CodeMirror from "codemirror";
import "codemirror/addon/mode/simple";
import "codemirror/addon/hint/show-hint";
import "codemirror/mode/javascript/javascript";
import "codemirror/addon/selection/mark-selection";
import "codemirror/addon/scroll/simplescrollbars";
import grokMode from "./codemirror/grok";
import { LoadModal } from "./components/LoadModal";
import { ShareModal } from "./components/ShareModal";
import { Ad } from "./components/Ad";
import { CustomPatternModal } from "./components/CustomPatternModal";
import Select from "react-select";
import useLocalStorage from "./hooks/useLocalStorage";
import { MorePatternsModal } from "./components/MorePatternsModal";

function App() {
  CodeMirror.defineSimpleMode("grokMode", grokMode);

  const urlSearchParams = new URLSearchParams(window.location.search);
  const qsParams = Object.fromEntries(urlSearchParams.entries());

  const [groks] = useState(new GrokCollection());
  let [pattern, setPattern] = useLocalStorage("gd-pattern", "");
  let [sample, setSample] = useLocalStorage(
    "gd-sample",
    "Your sample logs go here\nStart typing a pattern above for suggestions, e.g. %{WORD:word}\nNamed capture groups work too, e.g. (?<name>pattern)"
  );
  let [result, setResult] = useState("");
  let [samplesEditor, setSamplesEditor] = useState();
  let [patterns, setPatterns] = useState([]);
  let [customPatterns, setCustomPatterns] = useLocalStorage("gd-custom", []);
  let [showModal, setShowModal] = useState(null);
  let [matchCount, setMatchCount] = useState(0);
  let [sampleCount, setSampleCount] = useState(0);

  const defaultCollections = [
    { value: "custom", label: "Custom", active: true },
    { value: "aws", label: "AWS", active: false },
    { value: "bacula", label: "Bacula", active: false },
    { value: "bind", label: "BIND", active: false },
    { value: "bro", label: "Bro", active: false },
    { value: "exim", label: "Exim", active: false },
    { value: "firewalls", label: "Firewalls", active: false },
    { value: "grok-patterns", label: "Grok Patterns", active: true },
    { value: "haproxy", label: "HAProxy", active: false },
    { value: "httpd", label: "Httpd", active: false },
    { value: "java", label: "Java", active: false },
    { value: "junos", label: "Junos", active: false },
    { value: "linux-syslog", label: "Syslog", active: false },
    { value: "maven", label: "Maven", active: false },
    { value: "mcollective", label: "MCollective", active: false },
    { value: "mongodb", label: "MongoDB", active: false },
    { value: "nagios", label: "Nagios", active: false },
    {
      value: "postfix",
      label: "Postfix",
      active: false,
      url: "https://raw.githubusercontent.com/whyscream/postfix-grok-patterns/master/postfix.grok",
    },
    { value: "postgresql", label: "PostgreSQL", active: false },
    { value: "rails", label: "Rails", active: false },
    { value: "redis", label: "Redis", active: false },
    { value: "ruby", label: "Ruby", active: false },
    { value: "squid", label: "Squid", active: false },
    { value: "zeek", label: "Zeek", active: false },
  ];

  let [collections, setCollections] = useLocalStorage("gd-collections", defaultCollections);

  const firstUpdate = useRef(true);

  const loadExternalPatterns = async () => {
    await Promise.all(
      collections.filter((c) => c.active && c.value !== "custom").map((c) => loadCollection(c.value, c.label, c.url))
    );
  };

  const loadCustomPatterns = async () => {
    customPatterns.map((p) => {
      groks.createPattern(p.pattern, p.id);
    });
  };

  useEffect(() => {
    setPatterns((patterns) => [
      ...patterns,
      ...customPatterns.map((p) => {
        return { id: p.id, collection: "custom" };
      }),
    ]);
  }, [customPatterns]);

  const onLoad = async () => {
    // load query string parameters (if there are any)
    if (qsParams.pattern) setPattern(qsParams.pattern);
    if (qsParams.sample) setSample(qsParams.sample);
    await loadExternalPatterns();
    await loadCustomPatterns();

    // add any collections in default that user does not have in localstorage store
    const newCollections = defaultCollections.filter((d) => {
      return !collections.map((c) => c.value).includes(d.value);
    });
    if (newCollections.length) {
      setCollections((collections) => [...collections, ...newCollections]);
    }
  };

  const loadCollection = async (value, label, url) => {
    if (patterns.find((p) => p.collection === value)) return;
    label = label || value;
    url = url || "/patterns/" + value;
    try {
      const newPatterns = await groks.load(url).then((ids) => {
        return ids.map((id) => {
          if (patterns.includes({ id, collection: value })) return;
          return { id, collection: value };
        });
      });
      setPatterns((patterns) => [...patterns, ...newPatterns.flat()]);
      const updatedCollection = [...collections].map((c) => {
        if (c.value == value) {
          return { ...c, active: true };
        } else {
          return c;
        }
      });
      setCollections(updatedCollection);
    } catch (err) {
      console.log(err);
    }
  };

  const parseSample = async (lineNumber) => {
    try {
      let p = groks.createPattern(pattern);
      let sampleLine = samplesEditor.getLine(lineNumber);
      let result = await p.parse(sampleLine);
      if (!result) return null;
      let matches = p.regexp.searchSync(sampleLine).filter((m) => m.length > 0);
      matches.forEach((m, i) => {
        let bgColor = i === 0 ? "rgb(230, 180, 50, 0.3)" : "rgb(127, 191, 63, 0.4)";
        samplesEditor.markText(
          { line: lineNumber, ch: m.start },
          { line: lineNumber, ch: m.end },
          { css: "background-color: " + bgColor + " !important" }
        );
      });
      let data = {};
      Object.keys(result).map((key, i) => {
        data[key] = +result[key] === 0 ? 0 : +result[key] || result[key];
      });
      return data;
    } catch (error) {
      console.error(error);
    }
  };

  const handleParse = async () => {
    try {
      let output = [];
      const lines = samplesEditor.lineCount() - 1;
      for (let i = 0; i <= lines; i++) {
        samplesEditor.markText(
          { line: i, ch: 0 },
          { line: i, ch: Infinity },
          { css: "background-color: transparent !important" }
        );
        let data = await parseSample(i);
        output.push(data);
      }
      setMatchCount(output.reduce((acc, val) => (acc += +(val !== null)), 0));
      setSampleCount(output.length);
      setResult(JSON.stringify(output, null, 2));
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    onLoad();
  }, []);

  useEffect(() => {
    if (firstUpdate.current) {
      firstUpdate.current = false;
      return;
    }
    let timeout = setTimeout(() => handleParse(), 250);
    return () => clearTimeout(timeout);
  }, [pattern, sample, patterns]);

  const handleChangePattern = (editor, data, value) => {
    setPattern(value);
  };

  const handleSelectAction = async (newValue, actionMeta) => {
    const { action, option } = actionMeta;
    let newCollections = [...collections];
    switch (action) {
      case "select-option":
        if (patterns.find((p) => p.collection === option.value)) {
          newCollections = newCollections.map((c) => {
            if (c.value === option.value) {
              return { ...c, active: true };
            } else {
              return c;
            }
          });
          setCollections(newCollections);
        } else {
          loadCollection(option.value, option.label, option.url);
        }
        break;
      case "remove-value":
        newCollections = newCollections.map((c) =>
          newValue.map((nv) => nv.value).includes(c.value) ? { ...c, active: true } : { ...c, active: false }
        );
        setCollections(newCollections);
        break;
      case "clear":
        newCollections = newCollections.map((c) => {
          return { ...c, active: false };
        });
        setCollections(newCollections);
        break;
      default:
        break;
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="App">
      <Navbar />
      <div className="container">
        <div className="menu">
          <div className="collections-wrapper">
            <div>
              <Select
                isMulti
                theme={(theme) => ({
                  ...theme,
                  colors: {
                    ...theme.colors,
                    primary: "#89ddff",
                    primary25: "#333",
                    neutral0: "#111",
                    neutral10: "#333",
                    neutral20: "#666",
                    neutral30: "silver",
                    neutral40: "#fff",
                    neutral80: "#f0f0f0",
                  },
                })}
                options={collections}
                value={collections.filter((c) => c.active)}
                className="basic-multi-select"
                classNamePrefix="select"
                onChange={(newValue, actionMeta) => handleSelectAction(newValue, actionMeta)}
              ></Select>
            </div>
            <div style={{ marginTop: 10 }}>
              <a
                href="https://github.com/logstash-plugins/logstash-patterns-core/tree/main/patterns/ecs-v1"
                target="_blank"
              >
                <button className="btn secondary">
                  <ExternalLink />
                  <span>Pattern Repository</span>
                </button>
              </a>
            </div>
            <div style={{ marginTop: 10 }}>
              <button className="btn secondary" onClick={() => setShowModal("MORE_PATTERNS")}>
                <DownloadCloud />
                <span>More Patterns</span>
              </button>
            </div>
          </div>
          <Ad />
        </div>
        <div className="main">
          <div className="pattern-wrapper">
            <div className="input-menu">
              <h3>Grok Pattern</h3>
              <div title="copy">
                <Copy size="1.25rem" onClick={() => copyToClipboard(pattern)} />
              </div>
              <div title="add custom pattern">
                <PlusSquare size="1.25rem" onClick={() => setShowModal("CUSTOM_PATTERN")} />
              </div>
              <div title="load custom pattern">
                <Book size="1.25rem" onClick={() => setShowModal("LOAD")} />
              </div>
              <div title="share">
                <Share2 size="1.25rem" onClick={() => setShowModal("SHARE")} />
              </div>
            </div>
            <CodeMirrorTextarea
              style={{ height: "auto !important" }}
              autoScroll={false}
              options={{
                scrollbarStyle: "native",
                viewportMargin: Infinity,
                lineWrapping: true,
                mode: "grokMode",
                theme: "material-darker",
                showHint: true,
                hintOptions: {
                  completeSingle: false,
                  hint: (editor) => {
                    let cursorPos = editor.getDoc().getCursor();
                    let lastTokenRegex = /%{([^:}]*)$/g;
                    let keyword = lastTokenRegex.exec(pattern.substr(0, cursorPos.ch));
                    if (keyword !== null) {
                      const activeCollections = collections.filter((c) => c.active).map((c) => c.value);
                      return {
                        from: { ...cursorPos, ch: cursorPos.ch - keyword[1].length },
                        to: cursorPos,
                        list: patterns
                          .filter((p) => activeCollections.includes(p.collection))
                          .filter((p) => RegExp(keyword[1], "i").test(p.id))
                          .map((p) => p.id),
                      };
                    }
                  },
                },
              }}
              onInputRead={(editor, change) => {
                CodeMirror.showHint(editor);
              }}
              value={pattern}
              onChange={handleChangePattern}
              autoCursor={false}
            />
          </div>
          <div className="samples-wrapper">
            <div className="input-menu">
              <h3>Samples</h3>
              <div title="copy">
                <Copy size="1.25rem" onClick={() => copyToClipboard(sample)} />
              </div>
              <div title="clear">
                <Trash2 size="1.25rem" onClick={() => setSample()} />
              </div>
            </div>
            <CodeMirrorTextarea
              style={{ height: "100% !important" }}
              options={{
                scrollbarStyle: "overlay",
                viewportMargin: 0,
                lineWrapping: true,
                lineNumbers: true,
                theme: "material-darker",
                mode: null,
              }}
              value={sample}
              onChange={(editor, data, value) => setSample(value)}
              autoCursor={false}
              editorDidMount={(editor) => {
                setSamplesEditor(editor);
              }}
            />
          </div>
        </div>
        <div className="result">
          <div className="output-wrapper">
            <div className="output-top">
              <div className="input-menu">
                <h3>Output</h3>
                <div title="copy">
                  <Copy size="1.25rem" onClick={() => copyToClipboard(result)} />
                </div>
              </div>
              <div className={`counter ${!sampleCount ? "" : matchCount === sampleCount ? "all-match" : "no-match"}`}>
                {!sampleCount ? <></> : matchCount === sampleCount ? <Check /> : <></>}
                <span style={{ paddingLeft: "0.5rem" }}>{matchCount}</span>
                <span>{"/"}</span>
                <span>{sampleCount}</span>
              </div>
            </div>
            <CodeMirrorTextarea
              style={{ height: "100% !important" }}
              options={{
                scrollbarStyle: "overlay",
                viewportMargin: 0,
                readOnly: true,
                theme: "material-darker",
                mode: { name: "javascript", json: true },
              }}
              value={result}
            />
          </div>
        </div>
        {
          {
            LOAD: (
              <LoadModal
                setShowModal={setShowModal}
                customPatterns={customPatterns}
                setCustomPatterns={setCustomPatterns}
                setPattern={setPattern}
              />
            ),
            SHARE: <ShareModal setShowModal={setShowModal} pattern={pattern} sample={sample} />,
            CUSTOM_PATTERN: (
              <CustomPatternModal
                setShowModal={setShowModal}
                groks={groks}
                pattern={pattern}
                setPattern={setPattern}
                patterns={patterns}
                customPatterns={customPatterns}
                setCustomPatterns={setCustomPatterns}
              />
            ),
            MORE_PATTERNS: (
              <MorePatternsModal
                setShowModal={setShowModal}
                collections={collections}
                setCollections={setCollections}
                patterns={patterns}
                setPatterns={setPatterns}
                groks={groks}
              />
            ),
          }[showModal]
        }
      </div>
    </div>
  );
}

export default App;
