import { ArrowLeft, Pencil, Trash } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { resetLoading, setContacts } from "@/slices/contactsSlice.js";
import { ToastContext } from "@/contexts/ToastContext.jsx";
import Loading from "@/components/Loading.jsx";

function ContactContent() {
  const { t } = useTranslation();
  const { toast } = useContext(ToastContext);
  const view = useSelector((state) => state.view.view);
  const contactId = useSelector((state) => state.contacts.currentContact);
  const currentContact = useSelector((state) =>
    state.contacts.contacts.find(
      (contact) => contact.id == state.contacts.currentContact
    )
  );
  const loading = useSelector((state) => state.contacts.loading);
  const error = useSelector((state) => state.contacts.error);
  const [refresh, setRefresh] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(resetLoading());
    dispatch(setContacts);
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
    if (!loading && currentContact)
      document.title = `${currentContact.name || currentContact.address || t("unknown")} - MERNMail`;
    else document.title = "MERNMail";
  }, [currentContact, loading, t]);

  useEffect(() => {
    if (view == "contact") {
      const onBackButtonEvent = () => {
        setTimeout(() => {
          dispatch(resetLoading());
          dispatch(setContacts);
        }, 0);
      };

      window.addEventListener("popstate", onBackButtonEvent);
      return () => {
        window.removeEventListener("popstate", onBackButtonEvent);
      };
    }
  }, [view, dispatch]);

  if (loading) {
    return <Loading />;
  } else if (error) {
    return (
      <p className="text-red-500 block text-center">{t("unexpectederror")}</p>
    );
  } else if (!currentContact) {
    return <p className="text-center">{t("contactnotfound")}</p>;
  } else {
    return (
      <>
        <h1 className="text-3xl md:text-4xl mt-2 mb-2.5 pb-0.5 md:mb-2 md:pb-1 font-bold content-center overflow-hidden text-ellipsis">
          {currentContact.name || currentContact.address || t("unknown")}
        </h1>
        <ul className="mx-0.5 list-none">
          <li className="inline-block mx-0.5">
            <a
              href={encodeURI(`#contacts`)}
              onClick={(e) => {
                e.preventDefault();
                document.location.hash = encodeURI(`#contacts`);
              }}
              title={t("back")}
              className="inline-block align-middle w-8 h-8 p-1 rounded-sm bg-background text-foreground hover:bg-accent/60 hover:text-accent-foreground transition-colors"
            >
              <ArrowLeft
                width={24}
                height={24}
                className="inline w-6 h-6 align-top"
              />
            </a>
          </li>
          <li className="inline-block mx-0.5">
            <a
              href={encodeURI(`#editcontact/${contactId}`)}
              onClick={(e) => {
                e.preventDefault();
                document.location.hash = encodeURI(`#editcontact/${contactId}`);
              }}
              title={t("editcontact")}
              className="inline-block align-middle w-8 h-8 p-1 rounded-sm bg-background text-foreground hover:bg-accent/60 hover:text-accent-foreground transition-colors"
            >
              <Pencil
                width={24}
                height={24}
                className="inline w-6 h-6 align-top"
              />
            </a>
          </li>
          <li className="inline-block mx-0.5">
            <button
              onClick={async (e) => {
                e.preventDefault();
                try {
                  const res = await fetch(
                    `/api/addressbook/contact/${encodeURI(contactId)}`,
                    {
                      method: "DELETE",
                      credentials: "include"
                    }
                  );
                  const data = await res.json();
                  if (res.status == 200) {
                    toast(t("deletecontactsuccess"));
                    document.location.hash = encodeURI("#contacts");
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
        </ul>
        {currentContact.email ? (
          <div className="flex flex-col md:flex-row">
            <span className="shrink-0 md:px-2 md:py-1 self-top">
              {t("emailaddress2", { address: "" })}
            </span>
            <a
              href={`#compose/to/${encodeURI(currentContact.email)}`}
              className="grow md:px-2 md:py-1 self-top text-primary underline"
            >
              {currentContact.email}
            </a>
          </div>
        ) : (
          ""
        )}
        {currentContact.phoneNumber ? (
          <div className="flex flex-col md:flex-row">
            <span className="shrink-0 md:px-2 md:py-1 self-top">
              {t("phonenumber", { number: "" })}
            </span>
            <a
              href={`tel:${encodeURI(currentContact.phoneNumber)}`}
              className="grow md:px-2 md:py-1 self-top text-primary underline"
            >
              {currentContact.phoneNumber}
            </a>
          </div>
        ) : (
          ""
        )}
        {currentContact.website ? (
          <div className="flex flex-col md:flex-row">
            <span className="shrink-0 md:px-2 md:py-1 self-top">
              {t("website", { url: "" })}
            </span>
            <a
              href={currentContact.website}
              className="grow md:px-2 md:py-1 self-top text-primary underline"
            >
              {currentContact.website}
            </a>
          </div>
        ) : (
          ""
        )}
        {currentContact.address ? (
          <div className="flex flex-col md:flex-row">
            <span className="shrink-0 md:px-2 md:py-1 self-top">
              {t("address", { address: "" })}
            </span>
            <span className="grow md:px-2 md:py-1 self-top">
              {currentContact.address.split("\n").map((addressLine, index) => {
                return (
                  <p key={index} className="w-full block">
                    {addressLine}
                  </p>
                );
              })}
            </span>
          </div>
        ) : (
          ""
        )}
      </>
    );
  }
}

export default ContactContent;
