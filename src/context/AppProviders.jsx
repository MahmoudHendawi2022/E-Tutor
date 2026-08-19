import { AuthProvider } from "./AuthContext";
import { MasterDataProvider } from "./MasterDataContext";
import { PlatformSettingsProvider } from "./PlatformSettingsContext";
import { TutorsProvider } from "./TutorsContext";
import { AvailabilityProvider } from "./AvailabilityContext";
import { SavedTutorsProvider } from "./SavedTutorsContext";
import { NotificationsProvider } from "./NotificationsContext";
import { LessonsProvider } from "./LessonsContext";
import { PaymentsProvider } from "./PaymentsContext";
import { MessagesProvider } from "./MessagesContext";

/*
  BrowserRouter stays outside this component.
  LessonsProvider must stay above PaymentsProvider because payments release
  tutor earnings only when a lesson has been manually marked completed.
*/
function AppProviders({ children }) {
  return (
    <AuthProvider>
      <MasterDataProvider>
        <PlatformSettingsProvider>
          <TutorsProvider>
            <AvailabilityProvider>
              <SavedTutorsProvider>
                <NotificationsProvider>
                  <LessonsProvider>
                    <PaymentsProvider>
                      <MessagesProvider>{children}</MessagesProvider>
                    </PaymentsProvider>
                  </LessonsProvider>
                </NotificationsProvider>
              </SavedTutorsProvider>
            </AvailabilityProvider>
          </TutorsProvider>
        </PlatformSettingsProvider>
      </MasterDataProvider>
    </AuthProvider>
  );
}

export default AppProviders;
