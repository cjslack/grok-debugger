import React, { useEffect, useState, useRef } from 'react';
import { GrokCollection } from 'grok-js';
import { Navbar } from './components/Navbar';
import { SaveModal } from './components/SaveModal';
import { UnControlled as CodeMirrorTextarea } from 'react-codemirror2';
import { FileText, Save, Book, Copy } from 'react-feather';
import CodeMirror from 'codemirror';
import 'codemirror/addon/mode/simple';
import 'codemirror/addon/hint/show-hint';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/selection/mark-selection';
import 'codemirror/addon/scroll/simplescrollbars';
import grokMode from './codemirror/grok';
import { LoadModal } from './components/LoadModal';

function App() {
  CodeMirror.defineSimpleMode('grokMode', grokMode);

  let [pattern, setPattern] = useState('');
  let [sample, setSample] = useState(
    'Your sample logs go here \nStart typing a pattern above for suggestions, e.g. %{WORD:word} \nNamed capture groups work too, e.g. (?<name>pattern)'
  );
  let [result, setResult] = useState('');
  let [groks, setGroks] = useState(new GrokCollection());
  let [samplesEditor, setSamplesEditor] = useState();
  let [collections, setCollections] = useState([
    { collection: 'firewalls', active: false },
    { collection: 'grok-patterns', active: true },
    { collection: 'haproxy', active: false },
    { collection: 'java', active: false },
    { collection: 'junos', active: false },
    { collection: 'linux-syslog', active: false },
    { collection: 'mcollective', active: false },
    { collection: 'mongodb', active: false },
    { collection: 'nagios', active: false },
    { collection: 'postgresql', active: false },
    { collection: 'redis', active: false },
    { collection: 'ruby', active: false },
  ]);
  let [patterns, setPatterns] = useState([]);
  let [savedPatterns, setSavedPatterns] = useState([]);
  let [showModal, setShowModal] = useState(null);

  const firstUpdate = useRef(true);

  const onLoad = () => {
    Promise.all(
      collections.map((c) => {
        return groks.load('/patterns/' + c.collection + '.txt').then((ids) => {
          return ids.map((id) => {
            return { id, collection: c.collection };
          });
        });
      })
    )
      .then((values) => setPatterns(values.flat()))
      .catch((err) => console.log(err));
  };

  const parseSample = async (lineNumber) => {
    try {
      let p = groks.createPattern(pattern);
      let sampleLine = samplesEditor.getLine(lineNumber);
      let result = await p.parse(sampleLine);
      if (!result) return null;
      let matches = p.regexp.searchSync(sampleLine).filter((m) => m.length > 0);
      matches.forEach((m, i) => {
        let bgColor = i === 0 ? 'rgb(230, 180, 50, 0.3)' : 'rgb(127, 191, 63, 0.4)';
        samplesEditor.markText({ line: lineNumber, ch: m.start }, { line: lineNumber, ch: m.end }, { css: 'background-color: ' + bgColor + ' !important' });
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
        samplesEditor.markText({ line: i, ch: 0 }, { line: i, ch: Infinity }, { css: 'background-color: transparent !important' });
        let data = await parseSample(i);
        output.push(data);
      }
      setResult(JSON.stringify(output, null, 2));
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    onLoad();
    setSavedPatterns(
      Object.entries(localStorage)
        .map((entry) => {
          let key = entry[0];
          return key.substr(0, 12) === 'grokdebugger'
            ? {
                title: key.substr(13, key.length),
                pattern: entry[1],
              }
            : { title: null, pattern: null };
        })
        .filter((e) => e.title !== null)
    );
  }, []);

  useEffect(() => {
    if (firstUpdate.current) {
      firstUpdate.current = false;
      return;
    }
    let timeout = setTimeout(() => handleParse(), 250);
    return () => clearTimeout(timeout);
  }, [pattern, sample]);

  const handleChangePattern = (editor, data, value) => {
    setPattern(value);
  };

  const handleToggleActive = (collection) => {
    console.log(collection);
    let copy = [...collections];
    return copy.map((c) => (c.collection === collection ? { ...c, active: !c.active } : c));
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
            {collections.map((collection, i) => {
              return (
                <div style={{ display: 'flex', alignItems: 'center' }} key={collection.collection}>
                  <input type="checkbox" checked={collections[i].active} onChange={() => setCollections(handleToggleActive(collection.collection))} />
                  <h5>{collection.collection}</h5>
                  <a href={'/patterns/' + collection.collection + '.txt'} target="_blank" style={{ color: 'silver' }}>
                    <FileText size="1rem" />
                  </a>
                </div>
              );
            })}
          </div>
        </div>
        <div className="main">
          <div className="pattern-wrapper">
            <div className="input-menu">
              <h3>Grok Pattern</h3>
              <div title="copy">
                <Copy size="1.25rem" onClick={() => copyToClipboard(pattern)} />
              </div>
              <div title="save">
                <Save size="1.25rem" onClick={() => setShowModal('SAVE')} />
              </div>
              <div title="load">
                <Book size="1.25rem" onClick={() => setShowModal('LOAD')} />
              </div>
            </div>
            <CodeMirrorTextarea
              style={{ height: 'auto !important' }}
              autoScroll={false}
              options={{
                scrollbarStyle: 'native',
                viewportMargin: Infinity,
                lineWrapping: true,
                mode: 'grokMode',
                theme: 'material-darker',
                showHint: true,
                hintOptions: {
                  completeSingle: false,
                  hint: (editor) => {
                    let cursorPos = editor.getDoc().getCursor();
                    let lastTokenRegex = /%{([^:}]*)$/g;
                    let keyword = lastTokenRegex.exec(pattern.substr(0, cursorPos.ch));
                    if (keyword !== null) {
                      return {
                        from: { ...cursorPos, ch: cursorPos.ch - keyword[1].length },
                        to: cursorPos,
                        list: patterns
                          .filter((p) => collections.filter((c) => c.collection === p.collection)[0].active)
                          .filter((p) => RegExp(keyword[1], 'i').test(p.id))
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
            </div>
            <CodeMirrorTextarea
              style={{ height: '100% !important' }}
              options={{ scrollbarStyle: 'overlay', viewportMargin: 0, lineWrapping: true, lineNumbers: true, theme: 'material-darker', mode: null }}
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
            <div className="input-menu">
              <h3>Output</h3>
              <div title="copy">
                <Copy size="1.25rem" onClick={() => copyToClipboard(result)} />
              </div>
            </div>
            <CodeMirrorTextarea
              style={{ height: '100% !important' }}
              options={{ scrollbarStyle: 'overlay', viewportMargin: 0, readOnly: true, theme: 'material-darker', mode: { name: 'javascript', json: true } }}
              value={result}
            />
          </div>
        </div>
        {
          {
            SAVE: <SaveModal setShowModal={setShowModal} savedPatterns={savedPatterns} setSavedPatterns={setSavedPatterns} pattern={pattern} />,
            LOAD: <LoadModal setShowModal={setShowModal} savedPatterns={savedPatterns} setSavedPatterns={setSavedPatterns} setPattern={setPattern} />,
          }[showModal]
        }
      </div>
    </div>
  );
}

export default App;
