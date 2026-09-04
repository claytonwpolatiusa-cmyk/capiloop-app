import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { trpc } from "@/lib/trpc";

export default function AdminPartnersScreen() {
  const router = useRouter();
  const utils = trpc.useUtils();
  const accessQuery = trpc.adminSupport.access.useQuery();
  const partnersQuery = trpc.adminPartners.list.useQuery({ status: "pending" }, { enabled: accessQuery.data?.allowed === true });
  const reviewMutation = trpc.adminPartners.review.useMutation({
    onSuccess: () => {
      void utils.adminPartners.list.invalidate({ status: "pending" });
      void utils.adminPartners.list.invalidate();
    },
  });

  const review = (partnerId: number, status: "approved" | "rejected" | "suspended") => {
    const title = status === "approved" ? "Aprovar parceiro" : status === "rejected" ? "Rejeitar cadastro" : "Suspender parceiro";
    const message = status === "approved" ? "Este estabelecimento poderá publicar novas sacolas." : "A decisão ficará registrada para auditoria. Você poderá complementar a análise no painel administrativo.";
    Alert.alert(title, message, [
      { text: "Cancelar", style: "cancel" },
      { text: "Confirmar", onPress: () => reviewMutation.mutate({ partnerId, status }) },
    ]);
  };

  if (accessQuery.isLoading) return <ScreenContainer className="items-center justify-center"><ActivityIndicator color="#5E7D00" /></ScreenContainer>;
  if (accessQuery.data?.allowed !== true) return <ScreenContainer className="items-center justify-center" containerClassName="bg-[#F8FAF6]"><View style={styles.restricted}><MaterialIcons name="lock-outline" size={30} color="#4C5E43" /><Text style={styles.title}>Acesso restrito</Text><Text style={styles.copy}>Somente a equipe autorizada pode revisar estabelecimentos.</Text><Pressable onPress={() => router.back()} style={styles.primary}><Text style={styles.primaryText}>Voltar</Text></Pressable></View></ScreenContainer>;

  return <ScreenContainer edges={["top", "bottom", "left", "right"]} containerClassName="bg-[#F8FAF6]"><FlatList
    data={partnersQuery.data ?? []}
    keyExtractor={(item) => String(item.id)}
    contentContainerStyle={styles.content}
    refreshing={partnersQuery.isRefetching}
    onRefresh={() => { void partnersQuery.refetch(); }}
    ListHeaderComponent={<View style={styles.header}><Pressable onPress={() => router.back()} style={styles.back}><MaterialIcons name="arrow-back" size={21} color="#151B14" /></Pressable><Text style={styles.eyebrow}>GESTÃO</Text><Text style={styles.heading}>Aprovação de parceiros</Text><Text style={styles.subheading}>Revise os cadastros antes de liberar a publicação de sacolas.</Text><View style={styles.counter}><Text style={styles.counterNumber}>{partnersQuery.data?.length ?? 0}</Text><Text style={styles.counterLabel}>pendentes de análise</Text></View></View>}
    ListEmptyComponent={<View style={styles.empty}><MaterialIcons name="task-alt" size={34} color="#5E7D00" /><Text style={styles.emptyTitle}>Fila limpa</Text><Text style={styles.copy}>Não há parceiros aguardando revisão.</Text></View>}
    renderItem={({ item }) => <View style={styles.card}><View style={styles.cardTop}><View style={styles.icon}><MaterialIcons name="storefront" size={22} color="#5E7D00" /></View><View style={styles.cardInfo}><Text style={styles.business}>{item.businessName}</Text><Text style={styles.owner}>{item.ownerName || item.email}</Text></View><View style={styles.status}><Text style={styles.statusText}>PENDENTE</Text></View></View><View style={styles.details}><Text style={styles.detail}><Text style={styles.detailLabel}>CNPJ </Text>{item.cnpj}</Text><Text style={styles.detail}><Text style={styles.detailLabel}>Categoria </Text>{item.category}</Text><Text style={styles.detail}><Text style={styles.detailLabel}>Endereço </Text>{item.address}</Text><Text style={styles.detail}><Text style={styles.detailLabel}>Validação </Text>{item.cnpjStatus === "verified" ? "CNPJ verificado" : "Aguardando verificação"}</Text></View><View style={styles.actions}><Pressable disabled={reviewMutation.isPending} onPress={() => review(item.id, "rejected")} style={[styles.secondary, reviewMutation.isPending && styles.disabled]}><Text style={styles.secondaryText}>Rejeitar</Text></Pressable><Pressable disabled={reviewMutation.isPending} onPress={() => review(item.id, "approved")} style={[styles.primary, reviewMutation.isPending && styles.disabled]}><Text style={styles.primaryText}>Aprovar parceiro</Text></Pressable></View></View>}
  /></ScreenContainer>;
}

const styles = StyleSheet.create({ content: { padding: 20, paddingBottom: 34 }, header: { paddingTop: 8, paddingBottom: 22 }, back: { width: 40, height: 40, borderRadius: 14, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center", marginBottom: 24 }, eyebrow: { color: "#5E7D00", fontSize: 10, fontWeight: "900", letterSpacing: 1.2 }, heading: { color: "#151B14", fontSize: 30, lineHeight: 35, fontWeight: "900", letterSpacing: -1.2, marginTop: 7 }, subheading: { color: "#697065", fontSize: 13, lineHeight: 19, marginTop: 8 }, counter: { backgroundColor: "#EAF4D4", borderRadius: 18, padding: 15, marginTop: 18, flexDirection: "row", alignItems: "baseline", gap: 8 }, counterNumber: { color: "#151B14", fontSize: 25, fontWeight: "900" }, counterLabel: { color: "#5E7D00", fontSize: 12, fontWeight: "800" }, card: { backgroundColor: "#FFFFFF", borderRadius: 22, padding: 17, marginBottom: 13, borderWidth: 1, borderColor: "#E8ECE4" }, cardTop: { flexDirection: "row", alignItems: "center", gap: 11 }, icon: { width: 44, height: 44, borderRadius: 15, backgroundColor: "#EFF6E5", alignItems: "center", justifyContent: "center" }, cardInfo: { flex: 1 }, business: { color: "#151B14", fontSize: 16, fontWeight: "900" }, owner: { color: "#697065", fontSize: 11, marginTop: 3 }, status: { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 5, backgroundColor: "#FFF4DF" }, statusText: { color: "#99650B", fontSize: 9, fontWeight: "900", letterSpacing: 0.4 }, details: { borderTopWidth: 1, borderTopColor: "#EEF1EC", marginTop: 15, paddingTop: 12, gap: 6 }, detail: { color: "#4C574A", fontSize: 12, lineHeight: 17 }, detailLabel: { color: "#8A9586", fontWeight: "800" }, actions: { flexDirection: "row", gap: 9, marginTop: 16 }, primary: { minHeight: 46, paddingHorizontal: 15, borderRadius: 14, backgroundColor: "#151B14", alignItems: "center", justifyContent: "center", flex: 1 }, primaryText: { color: "#FFFFFF", fontSize: 12, fontWeight: "900" }, secondary: { minHeight: 46, paddingHorizontal: 15, borderRadius: 14, borderWidth: 1, borderColor: "#D8DED4", alignItems: "center", justifyContent: "center", flex: 0.65 }, secondaryText: { color: "#697065", fontSize: 12, fontWeight: "900" }, disabled: { opacity: 0.5 }, empty: { alignItems: "center", justifyContent: "center", paddingVertical: 70 }, emptyTitle: { color: "#151B14", fontSize: 18, fontWeight: "900", marginTop: 12 }, copy: { color: "#697065", fontSize: 13, lineHeight: 19, textAlign: "center", marginTop: 6 }, restricted: { alignItems: "center", paddingHorizontal: 28 }, title: { color: "#151B14", fontSize: 21, fontWeight: "900", marginTop: 13 }, });
