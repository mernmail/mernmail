import { Star, X, Plus, Check } from "lucide-react";
import { useEffect, useState, useContext } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { ToastContext } from "@/contexts/ToastContext.jsx";
import Loading from "@/components/Loading";
import { resetLoading, setIdentities } from "@/slices/settingsSlice";

function IdentitiesSettings() {
  const { t } = useTranslation();
  const { toast } = useContext(ToastContext);
  const loading = useSelector((state) => state.settings.loading);
  const error = useSelector((state) => state.settings.error);
  const identities = useSelector((state) => state.settings.identities);
  const [actions, setActions] = useState({});
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [refresh, setRefresh] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    const controller =
      typeof window.AbortController != "undefined"
        ? new AbortController()
        : undefined;
    const signal = controller ? controller.signal : undefined;

    dispatch(resetLoading());
    dispatch(setIdentities(signal));

    const interval = setInterval(() => {
      dispatch(setIdentities(signal));
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

        dispatch(setIdentities(signal));

        return () => {
          if (controller) controller.abort();
        };
      } else {
        setRefresh(false);
      }
    }
  }, [refresh, loading, dispatch]);

  useEffect(() => {
    document.title = `${t("identities")} - MERNMail`;
  }, [t]);

  if (loading) {
    return <Loading />;
  } else if (error) {
    return (
      <p className="text-red-500 block text-center">{t("unexpectederror")}</p>
    );
  } else {
    return (
      <>
        <h1 className="text-3xl md:text-4xl mt-2 mb-2.5 pb-0.5 md:mb-2 md:pb-1 font-bold content-center overflow-hidden text-ellipsis">
          {t("identities")}
        </h1>
        <form
          className="w-full text-base"
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              const res = await fetch(`/api/settings/identity`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json"
                },
                body: JSON.stringify({
                  identity: name ? `${name} <${address}>` : address
                }),
                credentials: "include"
              });
              const data = await res.json();
              if (res.status == 200) {
                toast(t("addidentitysuccess"));
                setActions({});
                dispatch(resetLoading());
                setRefresh(true);
              } else {
                toast(
                  t("addidentityfail", {
                    error: data.message
                  })
                );
              }
            } catch (err) {
              toast(
                t("addidentityfail", {
                  error: err.message
                })
              );
            }
            setName("");
            setAddress("");
          }}
        >
          <div className="flex flex-col md:flex-row mb-2">
            <label htmlFor="identity-name" className="shrink-0 md:px-2 md:py-1">
              {t("name", { name: "" })}
            </label>
            <div className="grow">
              <input
                onChange={(e) => setName(e.target.value)}
                value={name}
                id="identity-name"
                placeholder="John Smith"
                className="w-full bg-accent text-accent-foreground px-2 py-1 rounded-md focus:outline-primary focus:outline-2 focus:outline"
              />
            </div>
          </div>
          <div className="flex flex-col md:flex-row mb-2">
            <label
              htmlFor="identity-address"
              className="shrink-0 md:px-2 md:py-1"
            >
              {t("emailaddress2", { address: "" })}
            </label>
            <div className="grow">
              <input
                onChange={(e) => setAddress(e.target.value)}
                value={address}
                id="identity-address"
                type="email"
                placeholder="john.smith@example.com"
                required={true}
                className="w-full bg-accent text-accent-foreground px-2 py-1 rounded-md focus:outline-primary focus:outline-2 focus:outline"
              />
            </div>
          </div>
          <button
            type="submit"
            className="bg-primary text-primary-foreground p-2 mt-2 mr-2 rtl:mr-0 rtl:ml-2 rounded-md hover:bg-primary/75 transition-colors"
          >
            <Plus
              className="inline mr-2 rtl:mr-0 rtl:ml-2 align-top"
              size={24}
            />
            <span className="align-middle">{t("addidentity")}</span>
          </button>
        </form>
        <ul className="mt-4">
          {identities.map((identity) => {
            const displayedIdentity = identity.identity;
            const id = identity.id;
            const defaultIdentity = identity.default;
            return (
              <li key={id}>
                <div
                  title={displayedIdentity}
                  className={`bg-background text-foreground block my-1 px-2 py-1 pr-1 rtl:pr-2 rtl:pl-1 rounded-md hover:bg-accent/60 hover:text-accent-foreground transition-colors`}
                >
                  <div className="flex flex-row w-auto">
                    <button
                      onClick={async (e) => {
                        e.preventDefault();
                        if (!defaultIdentity) {
                          try {
                            const res = await fetch(
                              `/api/settings/identity/${encodeURI(id)}/default`,
                              {
                                method: "POST",
                                headers: {
                                  "Content-Type": "application/json"
                                },
                                body: JSON.stringify({}),
                                credentials: "include"
                              }
                            );
                            const data = await res.json();
                            if (res.status == 200) {
                              toast(t("setdefaultidentitysuccess"));
                              setActions({});
                              dispatch(resetLoading());
                              setRefresh(true);
                            } else {
                              toast(
                                t("setdefaultidentityfail", {
                                  error: data.message
                                })
                              );
                            }
                          } catch (err) {
                            toast(
                              t("setdefaultidentityfail", {
                                error: err.message
                              })
                            );
                          }
                        }
                      }}
                      title={t("setdefaultidentity")}
                      className="shrink-0 inline-block align-middle self-center w-6 h-6 mr-2 rtl:mr-0 rtl:ml-2 rounded-sm hover:bg-accent/60 hover:text-accent-foreground transition-colors"
                    >
                      <Star
                        width={16}
                        height={16}
                        className="inline w-6 h-6 align-top"
                        fill={defaultIdentity ? "#ffff00" : "none"}
                      />
                    </button>
                    {actions[id] == "remove" ? (
                      <>
                        <span className="grow overflow-hidden text-ellipsis whitespace-nowrap self-center text-red-500">
                          {t("reallyremoveidentity")}
                        </span>
                        <span className="shrink-0 ml-1 rtl:ml-0 rtl:mr-1 self-center">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              setActions({});
                            }}
                            title={t("cancel")}
                            className="inline-block align-middle w-6 h-6 mx-1 rounded-sm hover:bg-accent/60 hover:text-accent-foreground transition-colors"
                          >
                            <X
                              width={16}
                              height={16}
                              className="inline w-6 h-6 align-top"
                            />
                          </button>
                          <button
                            onClick={async (e) => {
                              e.preventDefault();
                              try {
                                const res = await fetch(
                                  `/api/settings/identity/${encodeURI(id)}`,
                                  {
                                    method: "DELETE",
                                    credentials: "include"
                                  }
                                );
                                const data = await res.json();
                                if (res.status == 200) {
                                  toast(t("deleteidentitysuccess"));
                                  dispatch(resetLoading());
                                  setRefresh(true);
                                } else {
                                  toast(
                                    t("deleteidentityfail", {
                                      error: data.message
                                    })
                                  );
                                }
                              } catch (err) {
                                toast(
                                  t("deleteidentityfail", {
                                    error: err.message
                                  })
                                );
                              }
                              setActions({});
                            }}
                            title={t("deleteidentity")}
                            className="inline-block align-middle w-6 h-6 mx-1 rounded-sm hover:bg-accent/60 hover:text-accent-foreground transition-colors"
                          >
                            <Check
                              width={16}
                              height={16}
                              className="inline w-6 h-6 align-top"
                            />
                          </button>
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="grow overflow-hidden text-ellipsis whitespace-nowrap self-center">
                          {displayedIdentity}
                        </span>
                        {!defaultIdentity ? (
                          <span className="shrink-0 ml-1 rtl:ml-0 rtl:mr-1 self-center">
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                const newActions = {};
                                newActions[id] = "remove";
                                setActions(newActions);
                              }}
                              title={t("deleteidentity")}
                              className="inline-block align-middle w-6 h-6 mx-1 rounded-sm hover:bg-accent/60 hover:text-accent-foreground transition-colors"
                            >
                              <X
                                width={16}
                                height={16}
                                className="inline w-6 h-6 align-top"
                              />
                            </button>
                          </span>
                        ) : (
                          ""
                        )}
                      </>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </>
    );
  }
}

export default IdentitiesSettings;
