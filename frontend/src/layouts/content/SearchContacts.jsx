import { Search, User } from "lucide-react";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
import {
  resetLoading,
  setSearchResults
} from "@/slices/searchContactsSlice.js";
import Loading from "@/components/Loading.jsx";

function SearchContent() {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const view = useSelector((state) => state.view.view);
  const loading = useSelector((state) => state.searchContacts.loading);
  const error = useSelector((state) => state.searchContacts.error);
  const isEmptyQuery = useSelector(
    (state) => state.searchContacts.isEmptyQuery
  );
  const results = useSelector((state) => state.searchContacts.results);
  const dispatch = useDispatch();

  useEffect(() => {
    const controller =
      typeof window.AbortController != "undefined"
        ? new AbortController()
        : undefined;
    const signal = controller ? controller.signal : undefined;

    dispatch(resetLoading());
    dispatch(setSearchResults(signal));

    return () => {
      if (controller) controller.abort();
    };
  }, [dispatch]);

  useEffect(() => {
    if (view == "searchcontacts") {
      let controller;
      let signal;

      const onBackButtonEvent = () => {
        setTimeout(() => {
          if (controller) controller.abort();
          controller =
            typeof window.AbortController != "undefined"
              ? new AbortController()
              : undefined;
          signal = controller ? controller.signal : undefined;
          dispatch(resetLoading());
          dispatch(setSearchResults(signal));
        }, 0);
      };

      window.addEventListener("popstate", onBackButtonEvent);
      return () => {
        window.removeEventListener("popstate", onBackButtonEvent);
        if (controller) controller.abort();
      };
    }
  }, [view, dispatch]);

  useEffect(() => {
    document.title = `${t("searchcontacts")} - MERNMail`;
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
          {t("searchcontacts")}
        </h1>
        <div className="flex mx-2 mb-2">
          <form
            className="w-full bg-accent text-base rounded-md flex flex-row flex-nowrap"
            onSubmit={(e) => {
              e.preventDefault();
              document.location.hash = encodeURI(`#searchcontacts/${query}`);
            }}
          >
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("searchcontacts")}
              className="bg-inherit h-full w-full pl-2 pr-0 rtl:pl-0 rtl:pr-2 rounded-md focus:outline-primary focus:outline-2 focus:outline"
            />
            <button
              type="submit"
              className="bg-transparent text-inherit shrink-0"
            >
              <Search
                width={32}
                height={32}
                className="inline-block h-full p-1 text-accent-foreground"
              >
                <title>{t("searchcontacts")}</title>
              </Search>
            </button>
          </form>
        </div>
        {results.length > 0 ? (
          <ul className="list-none border-border border-t-2">
            {results.map((result) => {
              const title = result.name || result.email || t("unknown");
              const email = result.email || "";
              const id = result.id;
              return (
                <li className="block border-border border-b-2" key={id}>
                  <div
                    onClick={() => {
                      document.location.hash = encodeURI(`#contact/${id}`);
                    }}
                    className="block bg-background px-1 md:pl-0.5 rtl:md:pl-1 rtl:md:pr-0.5 py-1 text-foreground hover:bg-accent/60 hover:text-accent-foreground transition-colors cursor-pointer"
                  >
                    <div className="flex flex-col md:flex-row">
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
        ) : isEmptyQuery ? (
          ""
        ) : (
          <p className="text-center">{t("nocontacts")}</p>
        )}
      </>
    );
  }
}

export default SearchContent;
