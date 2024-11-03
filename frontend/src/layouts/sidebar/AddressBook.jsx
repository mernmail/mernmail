import { User, UserPlus } from "lucide-react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import {
  setContacts,
  setCurrentContactFromURL
} from "@/slices/contactsSlice.js";
import { hideMenu } from "@/slices/menuSlice.js";
import Loading from "@/components/Loading.jsx";

function EmailSidebar() {
  const { t } = useTranslation();
  const view = useSelector((state) => state.view.view);
  const loading = useSelector((state) => state.contacts.loading);
  const error = useSelector((state) => state.contacts.error);
  const contacts = useSelector((state) => state.contacts.contacts);
  const currentContact = useSelector((state) => state.contacts.currentContact);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setContacts);

    const interval = setInterval(() => {
      dispatch(setContacts);
    }, 10000);

    return () => clearInterval(interval);
  }, [dispatch]);

  useEffect(() => {
    if (view == "contact") {
      const onBackButtonEvent = () => {
        setTimeout(() => {
          dispatch(setCurrentContactFromURL());
        }, 0);
      };

      window.addEventListener("popstate", onBackButtonEvent);
      return () => {
        window.removeEventListener("popstate", onBackButtonEvent);
      };
    }
  }, [view, dispatch]);

  useEffect(() => {
    if (view == "contact") {
      dispatch(setCurrentContactFromURL());
    }
  }, [view, loading, dispatch]);

  if (loading) {
    return <Loading />;
  } else if (error) {
    return (
      <p className="text-red-500 block text-center">{t("unexpectederror")}</p>
    );
  } else {
    return (
      <>
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            if (
              document.location.hash &&
              !document.location.hash.match(/^#editcontact$/)
            ) {
              let loseContactData = true;
              if (
                document.location.hash &&
                document.location.hash.match(/^#editcontact\//)
              ) {
                loseContactData = confirm(t("exiteditcontact"));
              }
              if (loseContactData) {
                dispatch(hideMenu());
                document.location.hash = encodeURI(`#editcontact`);
              }
            }
          }}
          className="inline-block text-center w-full bg-primary text-primary-foreground p-2 mt-2 rounded-md hover:bg-primary/75 transition-colors"
        >
          <UserPlus
            className="inline mr-2 rtl:mr-0 rtl:ml-2 align-top"
            size={24}
          />
          <span className="align-middle">{t("newcontact")}</span>
        </a>
        <ul className="mt-4">
          {contacts.map((contact) => {
            const title = contact.name || contact.email || t("unknown");
            const id = contact.id;
            return (
              <li key={id}>
                <a
                  href={encodeURI(`#contact/${id}`)}
                  onClick={(e) => {
                    e.preventDefault();
                    let loseContactData = true;
                    if (
                      document.location.hash &&
                      document.location.hash.match(/^#editcontact(?=$|\/)/)
                    ) {
                      loseContactData = confirm(t("exiteditcontact"));
                    }
                    if (loseContactData) {
                      dispatch(hideMenu());
                      document.location.hash = encodeURI(`#contact/${id}`);
                    }
                  }}
                  title={title}
                  className={`${view == "contact" && currentContact == id ? "bg-accent text-accent-foregound" : "bg-background text-foreground"} block my-1 px-2 py-1 rounded-md hover:bg-accent/60 hover:text-accent-foreground transition-colors`}
                >
                  <div className="flex flex-row w-auto">
                    <User
                      className="shrink-0 inline mr-2 rtl:mr-0 rtl:ml-2 align-top"
                      size={24}
                    />
                    <span className="grow overflow-hidden text-ellipsis whitespace-nowrap self-center">
                      {title}
                    </span>
                  </div>
                </a>
              </li>
            );
          })}
        </ul>
      </>
    );
  }
}

export default EmailSidebar;
