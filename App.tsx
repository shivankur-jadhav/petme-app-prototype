import React, { useCallback, useEffect, useState } from "react";
import { BackHandler, StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Animated, { FadeIn } from "react-native-reanimated";
import { useFonts, SpaceGrotesk_500Medium, SpaceGrotesk_600SemiBold, SpaceGrotesk_700Bold } from "@expo-google-fonts/space-grotesk";
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from "@expo-google-fonts/inter";
import { C } from "./src/theme";
import { StoreProvider, useStore } from "./src/store";
import { TabBar, TabId, Sheet } from "./src/components/visuals";
import { Toast } from "./src/components/ui";
import TanksScreen from "./src/screens/TanksScreen";
import BookScreen from "./src/screens/BookScreen";
import HistoryScreen, { ReportScreen } from "./src/screens/HistoryScreen";
import LivestockScreen from "./src/screens/LivestockScreen";
import ProScreen from "./src/screens/ProScreen";

function Shell() {
  const { ready, bookings, wish } = useStore();
  const [tab, setTab] = useState<TabId>("tanks");
  const [reportId, setReportId] = useState<string | null>(null);
  const [sheet, setSheet] = useState<React.ReactNode>(null);

  const go = useCallback((t: TabId) => { setReportId(null); setTab(t); }, []);
  const openReport = useCallback((id: string) => setReportId(id), []);
  const closeSheet = useCallback(() => setSheet(null), []);

  // Android back button closes the sheet, then the report, then returns to Tanks.
  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (sheet) { setSheet(null); return true; }
      if (reportId) { setReportId(null); return true; }
      if (tab !== "tanks") { setTab("tanks"); return true; }
      return false;
    });
    return () => sub.remove();
  }, [sheet, reportId, tab]);

  if (!ready) return <View style={{ flex: 1, backgroundColor: C.bg }} />;

  const open = bookings.filter((b) => b.status === "new").length;
  const props = { go, openReport };
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      {/* Each tab re-mounts with a soft fade so its cards can stagger in again. */}
      <Animated.View key={tab} entering={FadeIn.duration(220)} style={{ flex: 1 }}>
        {tab === "tanks" && <TanksScreen {...props} />}
        {tab === "book" && <BookScreen openReport={openReport} showSheet={setSheet} closeSheet={closeSheet} />}
        {tab === "history" && <HistoryScreen {...props} />}
        {tab === "livestock" && <LivestockScreen go={go} />}
        {tab === "pro" && <ProScreen {...props} />}
      </Animated.View>
      {reportId ? <ReportScreen id={reportId} onClose={() => setReportId(null)} go={go} /> : null}
      <TabBar value={tab} onChange={go} badges={{ pro: open || undefined, livestock: wish.length || undefined }} />
      <Sheet open={!!sheet} onClose={closeSheet}>{sheet}</Sheet>
      <Toast />
    </View>
  );
}

export default function App() {
  const [loaded] = useFonts({
    SpaceGrotesk_500Medium, SpaceGrotesk_600SemiBold, SpaceGrotesk_700Bold,
    Inter_400Regular, Inter_500Medium, Inter_600SemiBold,
  });
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: C.bg }]}>
        {loaded ? <StoreProvider><Shell /></StoreProvider> : null}
      </View>
    </SafeAreaProvider>
  );
}
