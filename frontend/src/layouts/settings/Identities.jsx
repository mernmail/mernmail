import { Star, X, Plus, Check } from "lucide-react";
import { useEffect, useState /*, useContext*/ } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch /*, useSelector*/ } from "react-redux";
import { setMailboxes } from "@/slices/mailboxesSlice.js";
//import { ToastContext } from "@/contexts/ToastContext.jsx";

const identities = [
  { id: 0, identity: "John Smith <john.smith@example.com>", default: true },
  { id: 1, identity: "John Smith <john.smith@example.org>", default: false }
];

function IdentitiesSettings() {
  const { t } = useTranslation();
  //const { toast } = useContext(ToastContext);
  const loading = false; //useSelector((state) => state.identities.loading);
  const error = false; //useSelector((state) => state.identities.error);
  //const identities = useSelector((state) => state.identities.identities);
  const [actions, setActions] = useState({});
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setMailboxes);

    const interval = setInterval(() => {
      dispatch(setMailboxes);
    }, 10000);

    return () => clearInterval(interval);
  }, [dispatch]);

  useEffect(() => {
    document.title = `${t("identities")} - MERNMail`;
  }, [t]);

  if (loading) {
    return <p className="text-center">{t("loading")}</p>;
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
            /*try {
                    const res = await fetch(`/api/receive/mailbox`, {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json"
                      },
                      body: JSON.stringify({
                        name: mailboxName
                      }),
                      credentials: "include"
                    });
                    const data = await res.json();
                    if (res.status == 200) {
                      toast(t("addmailboxsuccess"));
                      dispatch(setMailboxes);
                    } else {
                      toast(
                        t("addmailboxfail", {
                          error: data.message
                        })
                      );
                    }
                  } catch (err) {
                    toast(
                      t("addmailboxfail", {
                        error: err.message
                      })
                    );
                  }
                  setMailboxName("");*/
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
                      onClick={(e) => {
                        e.preventDefault();
                        alert(`Toggle default ${id}`);
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
                              /*try {
                                    const res = await fetch(
                                      `/api/receive/mailbox/${encodeURI(id)}`,
                                      {
                                        method: "DELETE",
                                        credentials: "include"
                                      }
                                    );
                                    const data = await res.json();
                                    if (res.status == 200) {
                                      toast(t("deletemailboxsuccess"));
                                      dispatch(setMailboxes);
                                    } else {
                                      toast(
                                        t("deletemailboxfail", {
                                          error: data.message
                                        })
                                      );
                                    }
                                  } catch (err) {
                                    toast(
                                      t("deletemailboxfail", {
                                        error: err.message
                                      })
                                    );
                                  }*/
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
