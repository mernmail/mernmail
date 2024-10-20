import { Bell } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

function NotificationsSettings() {
  const { t } = useTranslation();
  const notificationsSupported = !!window.Notification;
  const [status, setStatus] = useState(
    notificationsSupported ? window.Notification.permission : "unsupported"
  );

  useEffect(() => {
    document.title = `${t("notifications")} - MERNMail`;
  }, [t]);

  return (
    <>
      <h1 className="text-3xl md:text-4xl mt-2 mb-2.5 pb-0.5 md:mb-2 md:pb-1 font-bold content-center overflow-hidden text-ellipsis">
        {t("notifications")}
      </h1>
      {status != "unsupported" ? (
        status == "denied" ? (
          <p className="my-2">{t("notificationsdenied")}</p>
        ) : status == "granted" ? (
          <p className="my-2">{t("notificationsgranted")}</p>
        ) : (
          <button
            onClick={async (e) => {
              e.preventDefault();
              const permission = await window.Notification.requestPermission();
              setStatus(permission);
            }}
            className="bg-primary text-primary-foreground p-2 mt-2 mr-2 rtl:mr-0 rtl:ml-2 rounded-md hover:bg-primary/75 transition-colors"
          >
            <Bell
              className="inline mr-2 rtl:mr-0 rtl:ml-2 align-top"
              size={24}
            />
            <span className="align-middle">{t("grantpermission")}</span>
          </button>
        )
      ) : (
        <p className="my-2">{t("notificationsunsupported")}</p>
      )}
    </>
  );
}

export default NotificationsSettings;
