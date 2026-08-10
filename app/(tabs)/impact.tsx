import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { FlatList, StyleSheet, Text, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { useCapiLoop } from "@/lib/capiloop-store";

const milestones = [
  { title: "Protetor das Capivaras", subtitle: "Salve 10 sacolas", icon: "pets", goal: 10 },
  { title: "Herói do Clima", subtitle: "Evite 25 kg de CO₂", icon: "public", goal: 25 },
  { title: "Lenda do Loop", subtitle: "Salve 30 sacolas", icon: "workspace-premium", goal: 30 },
];

export default function ImpactScreen() {
  const { impact } = useCapiLoop();
  const nextGoal = 10;
  const progress = Math.min(impact.savedBags / nextGoal, 1);

  return (
    <ScreenContainer className="flex-1">
      <FlatList
        data={milestones}
        keyExtractor={(item) => item.title}
        contentContainerStyle={styles.content}
        renderItem={({ item }) => {
          const current = item.goal === 25 ? impact.co2Kg : impact.savedBags;
          const complete = current >= item.goal;
          return (
            <View style={styles.milestoneCard}>
              <View style={[styles.milestoneIcon, complete && styles.milestoneIconComplete]}><MaterialIcons name={item.icon as never} size={21} color="#151B14" /></View>
              <View style={styles.milestoneInfo}><Text style={styles.milestoneTitle}>{item.title}</Text><Text style={styles.milestoneSubtitle}>{item.subtitle}</Text></View>
              <MaterialIcons name={complete ? "check-circle" : "lock-outline"} size={21} color={complete ? "#5E7D00" : "#AEB5AA"} />
            </View>
          );
        }}
        ListHeaderComponent={
          <View>
            <Text style={styles.eyebrow}>PASSAPORTE VERDE</Text>
            <Text style={styles.title}>Seu impacto{`\n`}tem peso.</Text>
            <Text style={styles.subtitle}>Cada sacola resgatada vira economia e menos desperdício.</Text>
            <View style={styles.mainCard}>
              <View style={styles.mainCardTop}><View><Text style={styles.mainLabel}>CO₂ EVITADO</Text><Text style={styles.co2}>{impact.co2Kg.toFixed(1).replace(".", ",")} <Text style={styles.co2Unit}>kg</Text></Text></View><View style={styles.leafCircle}><MaterialIcons name="eco" size={27} color="#151B14" /></View></View>
              <View style={styles.metricsRow}><Metric value={String(impact.savedBags)} label="sacolas" /><View style={styles.metricSeparator} /><Metric value={`R$ ${impact.savings.toFixed(0)}`} label="economizados" /></View>
            </View>
            <View style={styles.levelCard}>
              <View style={styles.levelTop}><View><Text style={styles.levelLabel}>SEU NÍVEL</Text><Text style={styles.levelTitle}>Explorador do Loop</Text></View><Text style={styles.progressText}>{impact.savedBags}/{nextGoal}</Text></View>
              <View style={styles.track}><View style={[styles.progress, { width: `${progress * 100}%` }]} /></View>
              <Text style={styles.levelCopy}>Faltam {Math.max(nextGoal - impact.savedBags, 0)} sacolas para Protetor das Capivaras.</Text>
            </View>
            <Text style={styles.achievementsTitle}>Conquistas</Text>
          </View>
        }
      />
    </ScreenContainer>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return <View><Text style={styles.metricValue}>{value}</Text><Text style={styles.metricLabel}>{label}</Text></View>;
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingBottom: 25 },
  eyebrow: { color: "#5E7D00", fontSize: 10, fontWeight: "900", letterSpacing: 1.1, marginTop: 9 },
  title: { color: "#151B14", fontSize: 30, lineHeight: 35, letterSpacing: -1.4, fontWeight: "900", marginTop: 8 },
  subtitle: { color: "#697065", fontSize: 13, lineHeight: 19, marginTop: 8, maxWidth: 310 },
  mainCard: { marginTop: 22, padding: 20, borderRadius: 26, backgroundColor: "#A5DF00" },
  mainCardTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  mainLabel: { color: "#405500", fontSize: 10, fontWeight: "900", letterSpacing: 0.8 },
  co2: { color: "#151B14", fontSize: 37, lineHeight: 42, letterSpacing: -1.9, fontWeight: "900", marginTop: 3 },
  co2Unit: { fontSize: 17, letterSpacing: -0.4 },
  leafCircle: { width: 53, height: 53, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.52)", alignItems: "center", justifyContent: "center" },
  metricsRow: { flexDirection: "row", marginTop: 19, paddingTop: 16, borderTopWidth: 1, borderTopColor: "rgba(21,27,20,0.16)", gap: 22 },
  metricValue: { color: "#151B14", fontSize: 17, fontWeight: "900" },
  metricLabel: { color: "#405500", fontSize: 10, fontWeight: "800", marginTop: 2 },
  metricSeparator: { width: 1, height: 29, backgroundColor: "rgba(21,27,20,0.18)" },
  levelCard: { backgroundColor: "#FFFFFF", borderRadius: 23, padding: 18, marginTop: 14, borderWidth: 1, borderColor: "#E8ECE4" },
  levelTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  levelLabel: { color: "#697065", fontSize: 9, fontWeight: "900", letterSpacing: 0.7 },
  levelTitle: { color: "#151B14", fontSize: 15, fontWeight: "900", marginTop: 3 },
  progressText: { color: "#5E7D00", fontSize: 13, fontWeight: "900" },
  track: { height: 8, borderRadius: 4, backgroundColor: "#ECF0E8", marginTop: 15, overflow: "hidden" },
  progress: { height: "100%", borderRadius: 4, backgroundColor: "#A5DF00" },
  levelCopy: { color: "#697065", fontSize: 11, marginTop: 10 },
  achievementsTitle: { color: "#151B14", fontSize: 19, fontWeight: "900", letterSpacing: -0.6, marginTop: 25, marginBottom: 12 },
  milestoneCard: { backgroundColor: "#FFFFFF", borderRadius: 20, padding: 15, flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 10, borderWidth: 1, borderColor: "#E8ECE4" },
  milestoneIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: "#EFF1ED", alignItems: "center", justifyContent: "center" },
  milestoneIconComplete: { backgroundColor: "#ECF6CD" },
  milestoneInfo: { flex: 1 },
  milestoneTitle: { color: "#151B14", fontSize: 14, fontWeight: "800" },
  milestoneSubtitle: { color: "#697065", fontSize: 11, marginTop: 2 },
});
