import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { RefreshCw, Search, Trash, User } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { resetLoading, setContacts } from "@/slices/contactsSlice.js";
import { ToastContext } from "@/contexts/ToastContext";
import Loading from "@/components/Loading.jsx";

function ContactsContent() {
  const { t } = useTranslation();
  const { toast } = useContext(ToastContext);
  const [refresh, setRefresh] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState({});
  const [selectedAll, setSelectedAll] = useState(false);
  const [selectedAny, setSelectedAny] = useState(false);
  const contacts = useSelector((state) => state.contacts.contacts);
  const loading = useSelector((state) => state.contacts.loading);
  const error = useSelector((state) => state.contacts.error);
  const dispatch = useDispatch();
  const getSelectedContacts = () =>
    Object.keys(selectedContacts).filter((key) => selectedContacts[key]);

  useEffect(() => {
    setSelectedContacts({});
    dispatch(resetLoading());
    dispatch(setContacts);

    const interval = setInterval(() => {
      dispatch(setContacts);
    }, 10000);

    return () => {
      clearInterval(interval);
    };
  }, [dispatch]);

  useEffect(() => {
    if (refresh) {
      if (loading) {
        dispatch(setContacts);
      } else {
        setRefresh(false);
      }
    }
  }, [refresh, loading, dispatch]);

  useEffect(() => {
    document.title = `${t("contacts")} - MERNMail`;
  }, [t]);

  useEffect(() => {
    setSelectedAll(
      contacts &&
        contacts.length > 0 &&
        contacts.every((contact) => selectedContacts[contact.id])
    );
    setSelectedAny(
      contacts &&
        contacts.length > 0 &&
        contacts.find((contact) => selectedContacts[contact.id])
    );
  }, [selectedContacts, contacts]);

  if (loading) {
    return <Loading />;
  } else if (error) {
    return (
      <p className="text-red-500 block text-center">{t("unexpectederror")}</p>
    );
  } else {
    return (
      <>
        <div className="flex flex-col md:flex-row mt-2 mb-2">
          <h1 className="text-3xl md:text-4xl mb-0.5 pb-0.5 md:mb-0 md:pb-1 font-bold content-center grow overflow-hidden text-ellipsis">
            {t("contacts")}
          </h1>
          <p className="md:text-xl text-muted-foreground content-center whitespace-nowrap shrink-0">
            {t(contacts.length == 1 ? "1contact" : "numcontacts", {
              count: contacts.length
            })}
          </p>
        </div>
        <ul className="mx-0.5 list-none">
          <li className="inline-block mx-0.5">
            <input
              type="checkbox"
              onChange={() => {
                const currentSelectedAll = selectedAll;
                const newSelectedContacts = {};
                contacts.forEach((contact) => {
                  newSelectedContacts[contact.id] = !currentSelectedAll;
                });
                setSelectedContacts(newSelectedContacts);
              }}
              className="w-6 h-6 inline-block m-1 align-middle"
              title={t("selectall")}
              readOnly={false}
              checked={selectedAll}
            />
          </li>
          <li className="inline-block mx-0.5">
            <button
              onClick={(e) => {
                e.preventDefault();
                dispatch(resetLoading());
                setRefresh(true);
              }}
              title={t("refresh")}
              className="inline-block align-middle w-8 h-8 p-1 rounded-sm bg-background text-foreground hover:bg-accent/60 hover:text-accent-foreground transition-colors"
            >
              <RefreshCw
                width={24}
                height={24}
                className="inline w-6 h-6 align-top"
              />
            </button>
          </li>
          <li className="inline-block mx-0.5">
            <a
              href="#searchcontacts"
              onClick={(e) => {
                e.preventDefault();
                document.location.hash = encodeURI("#searchcontacts");
              }}
              title={t("searchcontacts")}
              className="inline-block align-middle w-8 h-8 p-1 rounded-sm bg-background text-foreground hover:bg-accent/60 hover:text-accent-foreground transition-colors"
            >
              <Search
                width={24}
                height={24}
                className="inline w-6 h-6 align-top"
              />
            </a>
          </li>
          {selectedAny ? (
            <>
              <li className="inline-block mx-0.5">
                <button
                  onClick={async (e) => {
                    e.preventDefault();
                    const contacts = getSelectedContacts();
                    try {
                      const res = await fetch(`/api/addressbook/contacts`, {
                        method: "DELETE",
                        headers: {
                          "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                          contacts: contacts
                        }),
                        credentials: "include"
                      });
                      const data = await res.json();
                      if (res.status == 200) {
                        toast(
                          t("deletecontactsuccess", {
                            error: data.message
                          })
                        );
                        setSelectedContacts({});
                        dispatch(resetLoading());
                        setRefresh(true);
                      } else {
                        toast(
                          t("deletecontactfail", {
                            error: data.message
                          })
                        );
                      }
                    } catch (err) {
                      toast(
                        t("deletecontactfail", {
                          error: err.message
                        })
                      );
                    }
                  }}
                  title={t("delete")}
                  className="inline-block align-middle w-8 h-8 p-1 rounded-sm bg-background text-foreground hover:bg-accent/60 hover:text-accent-foreground transition-colors"
                >
                  <Trash
                    width={24}
                    height={24}
                    className="inline w-6 h-6 align-top"
                  />
                </button>
              </li>
            </>
          ) : (
            ""
          )}
        </ul>
        {contacts.length > 0 ? (
          <ul className="list-none border-border border-t-2">
            {contacts
              .slice()
              .reverse()
              .map((contact) => {
                const title = contact.name || contact.email || t("unknown");
                const email = contact.email || "";
                const id = contact.id;
                return (
                  <li className="block border-border border-b-2" key={id}>
                    <div
                      onClick={() => {
                        document.location.hash = encodeURI(`#contact/${id}`);
                      }}
                      className="block bg-background px-1 md:pl-0.5 rtl:md:pl-1 rtl:md:pr-0.5 text-foreground hover:bg-accent/60 hover:text-accent-foreground transition-colors cursor-pointer"
                    >
                      <div className="flex flex-col md:flex-row">
                        <div className="shrink-0">
                          <span
                            className="inline-block shrink-0"
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                          >
                            <input
                              type="checkbox"
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                              onChange={() => {
                                const newSelectedContacts = Object.assign(
                                  {},
                                  selectedContacts
                                );
                                newSelectedContacts[id] = !selectedContacts[id];
                                setSelectedContacts(newSelectedContacts);
                              }}
                              checked={selectedContacts[id] || false}
                              className="w-6 h-6 mx-1.5 my-1 inline-block align-middle"
                              title={t("select")}
                            />
                          </span>
                        </div>
                        <p className="whitespace-nowrap grow font-bold overflow-hidden text-ellipsis md:self-center px-1">
                          <a
                            href={encodeURI(`#contact/${id}`)}
                            className="block whitespace-nowrap text-ellipsis overflow-hidden"
                            onClick={(e) => {
                              e.preventDefault();
                            }}
                          >
                            <User
                              width={24}
                              height={24}
                              className="inline w-6 h-6 mr-2 rtl:mr-0 rtl:ml-2 align-top"
                            />
                            {title}
                          </a>
                        </p>
                        <p className="whitespace-nowrap text-muted-foreground md:self-center px-1 overflow-hidden text-ellipsis">
                          {email}
                        </p>
                      </div>
                    </div>
                  </li>
                );
              })}
          </ul>
        ) : (
          <p className="text-center">{t("nocontacts")}</p>
        )}
      </>
    );
  }
}

export default ContactsContent;
