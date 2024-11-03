import { UserPlus, UserPen } from "lucide-react";
import { useEffect, useState, useContext } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { ToastContext } from "@/contexts/ToastContext.jsx";
import Loading from "@/components/Loading";
import { resetLoading, setContacts } from "@/slices/contactsSlice.js";
import isMobilePhone from "validator/lib/isMobilePhone";
import isEmail from "validator/lib/isEmail";
import isURL from "validator/lib/isURL";

function EditContactContent() {
  const { t } = useTranslation();
  const { toast } = useContext(ToastContext);
  const contacts = useSelector((state) => state.contacts.contacts);
  const contactsLoading = useSelector((state) => state.contacts.loading);
  const contactsError = useSelector((state) => state.contacts.error);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [website, setWebsite] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(true);
  const [contactId, setContactId] = useState(null);
  const [operating, setOperating] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    const loadContacts = () => {
      dispatch(resetLoading());
      dispatch(setContacts);
    };

    window.addEventListener("popstate", loadContacts);

    return () => {
      window.removeEventListener("popstate", loadContacts);
    };
  }, [dispatch]);

  useEffect(() => {
    const loadEditContact = () => {
      // Reset all variables
      setName("");
      setEmail("");
      setPhoneNumber("");
      setWebsite("");
      setAddress("");
      setLoading(true);
      setContactId(null);

      let contactData = {};
      let contactId = "";
      try {
        const editContactMatch = decodeURI(document.location.hash).match(
          /^#editcontact\/(.+)/
        );
        if (editContactMatch) {
          contactId = editContactMatch[1];
        }
        //eslint-disable-next-line no-unused-vars
      } catch (err) {
        // Hash URL parse error, invalid URL
      }

      contactId = contactId.replace(/\.\./g, ""); // Sanitize the contact ID

      if (contactId) {
        contactData = contacts.find((contact) => contact.id == contactId);
      }
      if (contactData) {
        if (contactData.name) setName(contactData.name);
        if (contactData.email) setEmail(contactData.email);
        if (contactData.phoneNumber) setPhoneNumber(contactData.phoneNumber);
        if (contactData.website) setWebsite(contactData.website);
        if (contactData.address) setAddress(contactData.address);
        setContactId(contactId);
      }
      setLoading(false);
    };

    if (!contactsLoading) {
      loadEditContact();

      window.addEventListener("popstate", loadEditContact);

      return () => {
        window.removeEventListener("popstate", loadEditContact);
      };
    }
  }, [t, contacts, contactsLoading]);

  useEffect(() => {
    document.title = `${t(contactId ? "editcontact" : "newcontact")} - MERNMail`;
  }, [t, contactId]);

  if (loading) {
    return <Loading />;
  } else if (contactsError) {
    return (
      <p className="text-red-500 block text-center">{t("unexpectederror")}</p>
    );
  } else {
    return (
      <>
        <h1 className="text-3xl md:text-4xl mt-2 mb-2.5 pb-0.5 md:mb-2 md:pb-1 font-bold content-center overflow-hidden text-ellipsis">
          {t(contactId ? "editcontact" : "newcontact")}
        </h1>
        <form
          className="w-full text-base"
          onSubmit={async (e) => {
            e.preventDefault();

            setOperating(true);

            try {
              const dataToSubmit = {
                name: name || null,
                email: email || null,
                address: address || null,
                phoneNumber: phoneNumber || null,
                website: website || null
              };

              const res = await fetch(
                contactId
                  ? `/api/addressbook/contact/${encodeURI(contactId)}`
                  : "/api/addressbook/contact",
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json"
                  },
                  body: JSON.stringify(dataToSubmit),
                  credentials: "include"
                }
              );
              const data = await res.json();
              if (res.status == 200) {
                toast(
                  t(contactId ? "editcontactsuccess" : "newcontactsuccess")
                );
                document.location.hash = encodeURI(
                  contactId ? `#contact/${contactId}` : "#contacts"
                );
              } else {
                setOperating(false);
                toast(
                  t(contactId ? "editcontactfail" : "newcontactfail", {
                    error: data.message
                  })
                );
              }
            } catch (err) {
              setOperating(false);
              toast(
                t(contactId ? "editcontactfail" : "newcontactfail", {
                  error: err.message
                })
              );
            }
          }}
        >
          <div className="flex flex-col md:flex-row mb-2">
            <label
              htmlFor="contact-name"
              className="shrink-0 md:px-2 md:py-1 self-top"
            >
              {t("name", { name: "" })}
            </label>
            <div className="grow">
              <input
                onChange={(e) => setName(e.target.value)}
                value={name}
                id="contact-name"
                placeholder="John Smith"
                className="w-full bg-accent text-accent-foreground px-2 py-1 rounded-md focus:outline-primary focus:outline-2 focus:outline self-center"
              />
            </div>
          </div>
          <div className="flex flex-col md:flex-row mb-2">
            <label
              htmlFor="contact-email"
              className="shrink-0 md:px-2 md:py-1 self-top"
            >
              {t("emailaddress2", { address: "" })}
            </label>
            <div className="grow">
              <input
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                id="contact-email"
                type="email"
                placeholder="john.smith@example.com"
                className="w-full bg-accent text-accent-foreground px-2 py-1 rounded-md focus:outline-primary focus:outline-2 focus:outline self-center"
              />
            </div>
          </div>
          <div className="flex flex-col md:flex-row mb-2">
            <label
              htmlFor="contact-email"
              className="shrink-0 md:px-2 md:py-1 self-top"
            >
              {t("phonenumber", { number: "" })}
            </label>
            <div className="grow">
              <input
                onChange={(e) => setPhoneNumber(e.target.value)}
                value={phoneNumber}
                id="contact-phone"
                type="tel"
                placeholder="+1 (800) 123-4567"
                className="w-full bg-accent text-accent-foreground px-2 py-1 rounded-md focus:outline-primary focus:outline-2 focus:outline self-center"
              />
            </div>
          </div>
          <div className="flex flex-col md:flex-row mb-2">
            <label
              htmlFor="contact-website"
              className="shrink-0 md:px-2 md:py-1 self-top"
            >
              {t("website", { url: "" })}
            </label>
            <div className="grow">
              <input
                onChange={(e) => setWebsite(e.target.value)}
                value={website}
                id="contact-website"
                type="url"
                placeholder="https://example.com"
                className="w-full bg-accent text-accent-foreground px-2 py-1 rounded-md focus:outline-primary focus:outline-2 focus:outline self-center"
              />
            </div>
          </div>
          <div className="flex flex-col md:flex-row mb-2">
            <label
              htmlFor="contact-address"
              className="shrink-0 md:px-2 md:py-1 self-top"
            >
              {t("address", { address: "" })}
            </label>
            <div className="grow">
              <textarea
                onChange={(e) => setAddress(e.target.value)}
                value={address}
                id="contact-address"
                rows={4}
                className="w-full bg-accent text-accent-foreground px-2 py-1 rounded-md focus:outline-primary focus:outline-2 focus:outline self-center"
              />
            </div>
          </div>

          <button
            type="submit"
            className="bg-primary text-primary-foreground p-2 mt-2 mr-2 rtl:mr-0 rtl:ml-2 rounded-md hover:bg-primary/75 disabled:bg-primary/50 transition-colors"
            disabled={
              (phoneNumber &&
                !isMobilePhone(String(phoneNumber).replace(/[ -()]/g, ""))) ||
              (email && !isEmail(email)) ||
              (website && !isURL(website, { protocols: ["http", "https"] })) ||
              operating
            }
          >
            {contactId ? (
              <UserPen
                className="inline mr-2 rtl:mr-0 rtl:ml-2 align-top"
                size={24}
              />
            ) : (
              <UserPlus
                className="inline mr-2 rtl:mr-0 rtl:ml-2 align-top"
                size={24}
              />
            )}
            <span className="align-middle">
              {t(contactId ? "editcontact" : "newcontact")}
            </span>
          </button>
        </form>
      </>
    );
  }
}

export default EditContactContent;
