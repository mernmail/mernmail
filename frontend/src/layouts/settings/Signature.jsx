import { lazy, Suspense, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { ToastContext } from "@/contexts/ToastContext";
import Loading from "@/components/Loading";
import { resetLoading, setSignature } from "@/slices/settingsSlice";
import DOMPurify from "dompurify";
import { Signature } from "lucide-react";

// Lazy load Quill WYSIWYG editor due to its bundled script size
const ReactQuill = lazy(() => import("@/components/ReactQuill.jsx"));

function SignatureSettings() {
  const { t } = useTranslation();
  const { toast } = useContext(ToastContext);
  const [refresh, setRefresh] = useState(false);
  const loading = useSelector((state) => state.settings.loading);
  const error = useSelector((state) => state.settings.error);
  const signature = useSelector((state) => state.settings.signature);
  const [newSignature, setNewSignature] = useState("");
  const dispatch = useDispatch();

  useEffect(() => {
    const controller =
      typeof window.AbortController != "undefined"
        ? new AbortController()
        : undefined;
    const signal = controller ? controller.signal : undefined;

    dispatch(resetLoading());
    dispatch(setSignature(signal));

    const interval = setInterval(() => {
      dispatch(setSignature(signal));
    }, 10000);

    return () => {
      clearInterval(interval);
      controller.abort();
    };
  }, [dispatch]);

  useEffect(() => {
    if (refresh) {
      if (loading) {
        const controller =
          typeof window.AbortController != "undefined"
            ? new AbortController()
            : undefined;
        const signal = controller ? controller.signal : undefined;

        dispatch(setSignature(signal));

        return () => {
          if (controller) controller.abort();
        };
      } else {
        setRefresh(false);
      }
    }
  }, [refresh, loading, dispatch]);

  useEffect(() => {
    if (!loading) setNewSignature(DOMPurify.sanitize(signature));
  }, [signature, loading]);

  useEffect(() => {
    document.title = `${t("signature")} - MERNMail`;
  }, [t]);

  if (loading) {
    return <Loading />;
  } else if (error) {
    return (
      <p className="text-red-500 block text-center">{t("unexpectederror")}</p>
    );
  } else {
    return (
      <Suspense fallback={<Loading />}>
        <h1 className="text-3xl md:text-4xl mt-2 mb-2.5 pb-0.5 md:mb-2 md:pb-1 font-bold content-center overflow-hidden text-ellipsis">
          {t("signature")}
        </h1>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              const res = await fetch(`/api/settings/signature`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json"
                },
                body: JSON.stringify({
                  signature: newSignature
                }),
                credentials: "include"
              });
              const data = await res.json();
              if (res.status == 200) {
                toast(t("savesignaturesuccess"));
                dispatch(resetLoading());
                setRefresh(true);
              } else {
                toast(
                  t("savesignaturefail", {
                    error: data.message
                  })
                );
              }
            } catch (err) {
              toast(
                t("savesignaturefail", {
                  error: err.message
                })
              );
            }
          }}
        >
          <ReactQuill
            theme="snow"
            value={newSignature}
            modules={{
              toolbar: {
                container: [
                  ["bold", "italic", "underline", "strike"],
                  ["blockquote", "code-block"],
                  ["link", "image"],

                  [{ list: "ordered" }, { list: "bullet" }],
                  [{ script: "sub" }, { script: "super" }],
                  [{ direction: "rtl" }],

                  [{ size: ["10px", false, "18px", "32px"] }],
                  [{ header: [1, 2, 3, 4, 5, 6, false] }],

                  [{ color: [] }, { background: [] }],
                  [{ font: [] }],
                  [{ align: [] }],

                  ["clean"]
                ]
              }
            }}
            onChange={(value) => {
              setNewSignature(value);
            }}
          />
          <button
            type="submit"
            className="bg-primary text-primary-foreground p-2 mt-2 mr-2 rtl:mr-0 rtl:ml-2 rounded-md hover:bg-primary/75 transition-colors"
          >
            <Signature
              className="inline mr-2 rtl:mr-0 rtl:ml-2 align-top"
              size={24}
            />
            <span className="align-middle">{t("savesignature")}</span>
          </button>
        </form>
      </Suspense>
    );
  }
}

export default SignatureSettings;
