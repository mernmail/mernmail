import { Send, X } from "lucide-react";
import { useState, lazy, Suspense, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import isEmail from "validator/lib/isEmail";
import Loading from "@/components/Loading.jsx";

// Lazy load Quill WYSIWYG editor due to its bundled script size
const ReactQuill = lazy(() => import("@/components/ReactQuill.jsx"));

function ComposeContent() {
  const { t } = useTranslation();
  const [contents, setContents] = useState("");
  const [toField, setToField] = useState("");
  const [toValues, setToValues] = useState([]);
  const [ccShown, setCcShown] = useState(false);
  const [ccField, setCcField] = useState("");
  const [ccValues, setCcValues] = useState([]);
  const [bccShown, setBccShown] = useState(false);
  const [bccField, setBccField] = useState("");
  const [bccValues, setBccValues] = useState([]);
  const [subject, setSubject] = useState("");
  const email = useSelector((state) => state.auth.email);

  useEffect(() => {
    document.title = `${t("compose")} - MERNMail`;
  }, [t]);

  return (
    <Suspense fallback={<Loading />}>
      <h1 className="text-3xl md:text-4xl mt-2 mb-2.5 pb-0.5 md:mb-2 md:pb-1 font-bold content-center overflow-hidden text-ellipsis">
        {t("compose")}
      </h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          alert(
            `To: ${toValues}\nCC: ${ccValues}\nBCC: ${bccValues}\nSubject: ${subject}\nContents in HTML: ${contents}`
          );
        }}
      >
        <div className="flex flex-col md:flex-row mb-2">
          <span className="shrink-0  md:px-2 md:py-1">
            {t("from", { from: "" })}
          </span>
          <span className="grow md:px-2 md:py-1">{email}</span>
          <div className="shrink-0">
            {!ccShown ? (
              <button
                className="bg-primary text-primary-foreground px-2 py-1 mt-2 mr-1 rtl:mr-0 rtl:ml-1 md:mt-0 md:mx-1 rounded-md hover:bg-primary/75 transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  setCcShown(true);
                }}
              >
                {t("cc", { cc: "" })}
              </button>
            ) : (
              ""
            )}
            {!bccShown ? (
              <button
                className="bg-primary text-primary-foreground px-2 py-1 mt-2 mr-1 rtl:mr-0 rtl:ml-1 md:mt-0 md:mx-1 rounded-md hover:bg-primary/75 transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  setBccShown(true);
                }}
              >
                {t("bcc", { bcc: "" })}
              </button>
            ) : (
              ""
            )}
          </div>
        </div>
        <div className="flex flex-col md:flex-row mb-2">
          <label htmlFor="compose-to" className="shrink-0 md:px-2 md:py-1">
            {t("to", { to: "" })}
          </label>
          <div className="grow">
            <input
              onChange={(e) => setToField(e.target.value)}
              value={toField}
              id="compose-to"
              placeholder="john.smith@example.com"
              className="w-full bg-accent text-accent-foreground px-2 py-1 rounded-md focus:outline-primary focus:outline-2 focus:outline"
              onKeyDown={(e) => {
                if (e.key == "Enter" || e.key == "," || e.key == " ") {
                  e.preventDefault();
                  if (isEmail(toField)) {
                    setToValues([...toValues, toField]);
                    setToField("");
                  }
                } else if (e.key == "Backspace" && toField == "") {
                  e.preventDefault();
                  const newToValues = [...toValues];
                  newToValues.pop();
                  setToValues(newToValues);
                }
              }}
              onBlur={() => {
                if (isEmail(toField)) {
                  setToValues([...toValues, toField]);
                  setToField("");
                }
              }}
            />
            {toValues.length > 0 ? (
              <ul>
                {toValues.map((toValue, index) => {
                  return (
                    <li
                      className="inline-block bg-primary text-primary-foreground px-2 py-1 mt-2 mr-1 rtl:mr-0 rtl:ml-1 rounded-md hover:bg-primary/75 transition-colors"
                      key={index}
                    >
                      <span className="align-middle">{toValue}</span>
                      <X
                        className="inline cursor-pointer ml-1 rtl:ml-0 rtl:mr-1 align-top"
                        onClick={() => {
                          const newToValues = [...toValues];
                          newToValues.splice(index, 1);
                          setToValues(newToValues);
                        }}
                        size={24}
                      >
                        <title>{t("delete")}</title>
                      </X>
                    </li>
                  );
                })}
              </ul>
            ) : (
              ""
            )}
          </div>
        </div>
        {ccShown ? (
          <div className="flex flex-col md:flex-row mb-2">
            <label htmlFor="compose-cc" className="shrink-0 md:px-2 md:py-1">
              {t("cc", { cc: "" })}
            </label>
            <div className="grow">
              <input
                onChange={(e) => setCcField(e.target.value)}
                value={ccField}
                id="compose-cc"
                placeholder="john.smith@example.com"
                className="w-full bg-accent text-accent-foreground px-2 py-1 rounded-md focus:outline-primary focus:outline-2 focus:outline"
                onKeyDown={(e) => {
                  if (e.key == "Enter" || e.key == "," || e.key == " ") {
                    e.preventDefault();
                    if (isEmail(ccField)) {
                      setCcValues([...ccValues, ccField]);
                      setCcField("");
                    }
                  } else if (e.key == "Backspace" && ccField == "") {
                    e.preventDefault();
                    const newCcValues = [...ccValues];
                    newCcValues.pop();
                    setCcValues(newCcValues);
                  }
                }}
                onBlur={() => {
                  if (isEmail(ccField)) {
                    setCcValues([...ccValues, ccField]);
                    setCcField("");
                  }
                }}
              />
              {ccValues.length > 0 ? (
                <ul>
                  {ccValues.map((ccValue, index) => {
                    return (
                      <li
                        className="inline-block bg-primary text-primary-foreground px-2 py-1 mt-2 mr-1 rtl:mr-0 rtl:ml-1 rounded-md hover:bg-primary/75 transition-colors"
                        key={index}
                      >
                        <span className="align-middle">{ccValue}</span>
                        <X
                          className="inline cursor-pointer ml-1 rtl:ml-0 rtl:mr-1 align-top"
                          onClick={() => {
                            const newCcValues = [...ccValues];
                            newCcValues.splice(index, 1);
                            setCcValues(newCcValues);
                          }}
                          size={24}
                        >
                          <title>{t("delete")}</title>
                        </X>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                ""
              )}
            </div>
          </div>
        ) : (
          ""
        )}
        {bccShown ? (
          <div className="flex flex-col md:flex-row mb-2">
            <label htmlFor="compose-bcc" className="shrink-0 md:px-2 md:py-1">
              {t("bcc", { bcc: "" })}
            </label>
            <div className="grow">
              <input
                onChange={(e) => setBccField(e.target.value)}
                value={bccField}
                id="compose-bcc"
                placeholder="john.smith@example.com"
                className="w-full bg-accent text-accent-foreground px-2 py-1 rounded-md focus:outline-primary focus:outline-2 focus:outline"
                onKeyDown={(e) => {
                  if (e.key == "Enter" || e.key == "," || e.key == " ") {
                    e.preventDefault();
                    if (isEmail(bccField)) {
                      setBccValues([...bccValues, bccField]);
                      setBccField("");
                    }
                  } else if (e.key == "Backspace" && bccField == "") {
                    e.preventDefault();
                    const newBccValues = [...bccValues];
                    newBccValues.pop();
                    setBccValues(newBccValues);
                  }
                }}
                onBlur={() => {
                  if (isEmail(bccField)) {
                    setBccValues([...bccValues, bccField]);
                    setBccField("");
                  }
                }}
              />
              {bccValues.length > 0 ? (
                <ul>
                  {bccValues.map((bccValue, index) => {
                    return (
                      <li
                        className="inline-block bg-primary text-primary-foreground px-2 py-1 mt-2 mr-1 rtl:mr-0 rtl:ml-1 rounded-md hover:bg-primary/75 transition-colors"
                        key={index}
                      >
                        <span className="align-middle">{bccValue}</span>
                        <X
                          className="inline cursor-pointer ml-1 rtl:ml-0 rtl:mr-1 align-top"
                          onClick={() => {
                            const newBccValues = [...bccValues];
                            newBccValues.splice(index, 1);
                            setBccValues(newBccValues);
                          }}
                          size={24}
                        >
                          <title>{t("delete")}</title>
                        </X>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                ""
              )}
            </div>
          </div>
        ) : (
          ""
        )}
        <div className="flex flex-col md:flex-row mb-2">
          <label htmlFor="compose-subject" className="shrink-0 md:px-2 md:py-1">
            {t("subject", { subject: "" })}
          </label>
          <div className="grow">
            <input
              onChange={(e) => setSubject(e.target.value)}
              value={subject}
              id="compose-subject"
              required
              className="w-full bg-accent text-accent-foreground px-2 py-1 rounded-md focus:outline-primary focus:outline-2 focus:outline"
              onKeyDown={(e) => {
                if (e.key == "Enter") {
                  e.preventDefault();
                }
              }}
            />
          </div>
        </div>
        <ReactQuill
          theme="snow"
          value={contents}
          modules={{
            toolbar: {
              container: [
                ["bold", "italic", "underline", "strike"], // toggled buttons
                ["blockquote", "code-block"],
                ["link", "image"],

                [{ list: "ordered" }, { list: "bullet" }, { list: "check" }],
                [{ script: "sub" }, { script: "super" }], // superscript/subscript
                [{ indent: "-1" }, { indent: "+1" }], // outdent/indent
                [{ direction: "rtl" }], // text direction

                [{ size: ["10px", false, "18px", "32px"] }], // custom dropdown
                [{ header: [1, 2, 3, 4, 5, 6, false] }],

                [{ color: [] }, { background: [] }], // dropdown with defaults from theme
                [{ font: [] }],
                [{ align: [] }],

                ["clean"] // remove formatting button
              ]
            }
          }}
          onChange={(value) => {
            setContents(value);
          }}
        />
        <button
          type="submit"
          className="bg-primary text-primary-foreground p-2 mt-2 mr-2 rtl:mr-0 rtl:ml-2 rounded-md hover:bg-primary/75 disabled:bg-primary/50 transition-colors"
          disabled={
            toValues.length == 0 &&
            ccValues.length == 0 &&
            bccValues.length == 0
          }
        >
          <Send className="inline mr-2 rtl:mr-0 rtl:ml-2 align-top" size={24} />
          <span className="align-middle">{t("send")}</span>
        </button>
      </form>
    </Suspense>
  );
}

export default ComposeContent;
