import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as Haptics from "expo-haptics";
import * as Linking from "expo-linking";
import * as MailComposer from "expo-mail-composer";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Alert, FlatList, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { useAuth } from "@/hooks/use-auth";
import { buildMailtoUrl, buildSupportEmail, getHelpNextAction, getHelpTopic, HELP_TOPICS, SUPPORT_EMAIL, type HelpNextAction, type HelpTopicId, type SupportEmailDraft } from "@/lib/help-center";

export default function HelpCenterScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [selectedTopicId, setSelectedTopicId] = useState<HelpTopicId | null>(null);
  const [details, setDetails] = useState("");
  const [isOpeningMail, setIsOpeningMail] = useState(false);
  const [manualDraft, setManualDraft] = useState<SupportEmailDraft | null>(null);
  const selectedTopic = useMemo(() => getHelpTopic(selectedTopicId), [selectedTopicId]);
  const nextAction = useMemo(() => selectedTopic ? getHelpNextAction(selectedTopic.id) : null, [selectedTopic]);

  const selectTopic = async (topicId: HelpTopicId) => {
    if (Platform.OS !== "web") {
      await Haptics.selectionAsync();
    }
    setSelectedTopicId(topicId);
    setManualDraft(null);
  };

  const sendSupportEmail = async () => {
    if (!selectedTopic || isOpeningMail) return;

    setIsOpeningMail(true);
    const draft = buildSupportEmail(selectedTopic, details, user?.email);
    setManualDraft(null);

    try {
      const nativeComposerAvailable = Platform.OS !== "web" && await MailComposer.isAvailableAsync();
      if (nativeComposerAvailable) {
        const result = await MailComposer.composeAsync({
          recipients: draft.recipients,
          subject: draft.subject,
          body: draft.body,
          isHtml: false,
        });
        if (result.status === MailComposer.MailComposerStatus.SENT) {
          if (Platform.OS !== "web") await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          Alert.alert("Mensagem enviada", "Recebemos seu pedido de ajuda. Em breve, o suporte retorna para você.");
        } else {
          setManualDraft(draft);
          Alert.alert("Rascunho pronto", "Você pode tentar abrir o e-mail novamente ou usar os dados de contato exibidos nesta tela.");
        }
        return;
      }

      const mailtoUrl = buildMailtoUrl(draft);
      const canOpen = await Linking.canOpenURL(mailtoUrl);
      if (!canOpen) throw new Error("Nenhum cliente de e-mail disponível.");
      await Linking.openURL(mailtoUrl);
    } catch {
      if (Platform.OS !== "web") await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setManualDraft(draft);
      Alert.alert(
        "E-mail não disponível",
        "Deixamos os dados da mensagem nesta tela para você copiar e enviar de qualquer aplicativo de e-mail.",
      );
    } finally {
      setIsOpeningMail(false);
    }
  };

  const runNextAction = async (action: HelpNextAction) => {
    if (Platform.OS !== "web") await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (action.kind === "email") {
      await sendSupportEmail();
      return;
    }
    if (action.route) router.push(action.route as never);
  };

  return (
    <ScreenContainer className="flex-1" containerClassName="bg-[#F8FAF6]">
      <FlatList
        data={HELP_TOPICS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Voltar ao perfil"
              onPress={() => router.back()}
              style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
            >
              <MaterialIcons name="arrow-back" size={21} color="#151B14" />
              <Text style={styles.backLabel}>Perfil</Text>
            </Pressable>

            <View style={styles.hero}>
              <View style={styles.heroIcon}><MaterialIcons name="support-agent" size={27} color="#151B14" /></View>
              <View style={styles.eyebrowRow}><View style={styles.eyebrowDot} /><Text style={styles.eyebrow}>SUPORTE CAPILOOP</Text></View>
              <Text style={styles.title}>Como podemos{`\n`}te ajudar?</Text>
              <Text style={styles.subtitle}>Escolha o assunto e deixe o app preparar sua mensagem para o time certo.</Text>
            </View>

            <Text style={styles.sectionLabel}>SELECIONE UM ASSUNTO</Text>
          </View>
        }
        renderItem={({ item }) => {
          const isSelected = selectedTopicId === item.id;
          return (
            <View style={styles.topicWrap}>
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                onPress={() => void selectTopic(item.id)}
                style={({ pressed }) => [styles.topic, isSelected && styles.topicSelected, pressed && styles.pressed]}
              >
                <View style={[styles.topicIcon, isSelected && styles.topicIconSelected]}>
                  <MaterialIcons name={item.icon as never} size={21} color="#151B14" />
                </View>
                <View style={styles.topicCopy}>
                  <Text style={styles.topicTitle}>{item.title}</Text>
                  <Text style={styles.topicDescription}>{item.description}</Text>
                </View>
                <MaterialIcons name={isSelected ? "expand-less" : "chevron-right"} size={23} color={isSelected ? "#151B14" : "#8D9687"} />
              </Pressable>

              {isSelected ? (
                <View style={styles.expandedCard}>
                  <View style={styles.answerHeader}><MaterialIcons name="lightbulb-outline" size={17} color="#556A20" /><Text style={styles.answerLabel}>ANTES DE ENVIAR</Text></View>
                  <Text style={styles.answer}>{item.quickAnswer}</Text>
                  <Text style={styles.inputLabel}>Quer acrescentar algum detalhe?</Text>
                  <TextInput
                    accessibilityLabel="Detalhes do pedido de ajuda"
                    value={details}
                    onChangeText={setDetails}
                    placeholder="Ex.: número do pedido, horário ou o que aconteceu"
                    placeholderTextColor="#8A9284"
                    multiline
                    textAlignVertical="top"
                    style={styles.input}
                  />
                  {nextAction ? (
                    <View style={styles.nextStep}>
                      <View style={styles.nextStepCopy}>
                        <Text style={styles.nextStepLabel}>PRÓXIMO PASSO</Text>
                        <Text style={styles.nextStepDescription}>{nextAction.description}</Text>
                      </View>
                      <Pressable
                        accessibilityRole="button"
                        onPress={() => void runNextAction(nextAction)}
                        style={({ pressed }) => [styles.nextStepButton, pressed && styles.pressed]}
                      >
                        <MaterialIcons name={nextAction.icon as never} size={18} color="#151B14" />
                        <Text style={styles.nextStepButtonText}>{nextAction.label}</Text>
                        <MaterialIcons name="arrow-forward" size={17} color="#151B14" />
                      </Pressable>
                    </View>
                  ) : null}
                </View>
              ) : null}
            </View>
          );
        }}
        ListFooterComponent={
          selectedTopic ? (
            <View style={styles.footerCard}>
              <Text style={styles.footerTitle}>Ainda precisa de ajuda?</Text>
              <Text style={styles.footerCopy}>Abra uma mensagem com o assunto e seus detalhes preenchidos. Você sempre revisa antes de enviar.</Text>
              <Pressable
                accessibilityRole="button"
                disabled={isOpeningMail}
                onPress={() => void sendSupportEmail()}
                style={({ pressed }) => [styles.emailButton, (pressed || isOpeningMail) && styles.pressed, isOpeningMail && styles.disabled]}
              >
                <MaterialIcons name="mail-outline" size={20} color="#FFFFFF" />
                <Text style={styles.emailButtonText}>{isOpeningMail ? "Abrindo e-mail…" : "Falar com o suporte"}</Text>
              </Pressable>
              {manualDraft ? (
                <View style={styles.manualContactCard}>
                  <View style={styles.manualContactHeading}>
                    <MaterialIcons name="content-copy" size={16} color="#D9F8A4" />
                    <Text style={styles.manualContactLabel}>ALTERNATIVA DISPONÍVEL</Text>
                  </View>
                  <Text style={styles.manualContactCopy}>Copie estes dados e envie de qualquer aplicativo de e-mail:</Text>
                  <Text selectable style={styles.manualContactEmail}>{SUPPORT_EMAIL}</Text>
                  <Text selectable style={styles.manualContactSubject}>Assunto: {manualDraft.subject}</Text>
                  <Text selectable style={styles.manualContactBody}>{manualDraft.body}</Text>
                </View>
              ) : null}
              <Text style={styles.privacyNote}>Seu dispositivo abre a mensagem; a CapiLoop não envia e-mails sem sua confirmação.</Text>
            </View>
          ) : (
            <View style={styles.emptyFooter}><Text style={styles.emptyFooterText}>Escolha uma opção para continuar.</Text></View>
          )
        }
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingBottom: 32 },
  backButton: { alignSelf: "flex-start", minHeight: 42, flexDirection: "row", alignItems: "center", gap: 6, marginTop: 6, paddingRight: 12 },
  backLabel: { color: "#151B14", fontSize: 13, fontWeight: "800" },
  hero: { marginTop: 15, marginBottom: 26 },
  heroIcon: { width: 52, height: 52, borderRadius: 18, backgroundColor: "#A5DF00", alignItems: "center", justifyContent: "center", marginBottom: 18 },
  eyebrowRow: { flexDirection: "row", alignItems: "center", gap: 7, marginBottom: 7 },
  eyebrowDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#A5DF00" },
  eyebrow: { color: "#5E665B", fontSize: 10, fontWeight: "900", letterSpacing: 1.3 },
  title: { color: "#151B14", fontSize: 34, fontWeight: "900", letterSpacing: -1.5, lineHeight: 38 },
  subtitle: { color: "#65705F", fontSize: 14, lineHeight: 20, marginTop: 10, maxWidth: 320 },
  sectionLabel: { color: "#6F786A", fontSize: 10, fontWeight: "900", letterSpacing: 1.2, marginBottom: 9 },
  topicWrap: { marginBottom: 10 },
  topic: { minHeight: 78, flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: 19, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E5EAE1" },
  topicSelected: { borderColor: "#A5DF00", backgroundColor: "#FCFFF6" },
  topicIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: "#F0F3ED", alignItems: "center", justifyContent: "center" },
  topicIconSelected: { backgroundColor: "#A5DF00" },
  topicCopy: { flex: 1 },
  topicTitle: { color: "#151B14", fontSize: 14, fontWeight: "900" },
  topicDescription: { color: "#6D7668", fontSize: 11, lineHeight: 15, marginTop: 3 },
  expandedCard: { marginTop: -4, paddingHorizontal: 15, paddingTop: 17, paddingBottom: 15, borderBottomLeftRadius: 19, borderBottomRightRadius: 19, backgroundColor: "#EDF7D9", borderWidth: 1, borderTopWidth: 0, borderColor: "#A5DF00" },
  answerHeader: { flexDirection: "row", alignItems: "center", gap: 6 },
  answerLabel: { color: "#556A20", fontSize: 10, letterSpacing: 0.8, fontWeight: "900" },
  answer: { color: "#354522", fontSize: 12, lineHeight: 17, marginTop: 8 },
  inputLabel: { color: "#556A20", fontSize: 11, fontWeight: "900", marginTop: 14, marginBottom: 7 },
  input: { minHeight: 84, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 13, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#D7E7BB", color: "#151B14", fontSize: 12, lineHeight: 17 },
  nextStep: { marginTop: 14, paddingTop: 13, borderTopWidth: 1, borderTopColor: "#D7E7BB" },
  nextStepCopy: { marginBottom: 10 },
  nextStepLabel: { color: "#556A20", fontSize: 10, letterSpacing: 0.8, fontWeight: "900" },
  nextStepDescription: { color: "#4B5A3D", fontSize: 11, lineHeight: 16, marginTop: 4 },
  nextStepButton: { minHeight: 44, paddingHorizontal: 12, borderRadius: 13, backgroundColor: "#A5DF00", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7 },
  nextStepButtonText: { flex: 1, color: "#151B14", fontSize: 12, fontWeight: "900" },
  footerCard: { borderRadius: 23, backgroundColor: "#151B14", marginTop: 15, padding: 19 },
  footerTitle: { color: "#FFFFFF", fontSize: 18, fontWeight: "900", letterSpacing: -0.4 },
  footerCopy: { color: "#D4DBCD", fontSize: 12, lineHeight: 17, marginTop: 6 },
  emailButton: { minHeight: 49, borderRadius: 15, backgroundColor: "#A5DF00", marginTop: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  emailButtonText: { color: "#151B14", fontSize: 14, fontWeight: "900" },
  manualContactCard: { marginTop: 14, borderRadius: 14, padding: 12, backgroundColor: "#2A3526", borderWidth: 1, borderColor: "#53644C" },
  manualContactHeading: { flexDirection: "row", alignItems: "center", gap: 6 },
  manualContactLabel: { color: "#D9F8A4", fontSize: 10, fontWeight: "900", letterSpacing: 0.7 },
  manualContactCopy: { color: "#D4DBCD", fontSize: 11, lineHeight: 16, marginTop: 7 },
  manualContactEmail: { color: "#FFFFFF", fontSize: 12, fontWeight: "900", marginTop: 7 },
  manualContactSubject: { color: "#D9F8A4", fontSize: 11, lineHeight: 16, marginTop: 5 },
  manualContactBody: { color: "#E8EDE3", fontSize: 11, lineHeight: 16, marginTop: 7 },
  privacyNote: { color: "#AAB3A3", fontSize: 10, lineHeight: 14, marginTop: 11, textAlign: "center" },
  emptyFooter: { paddingVertical: 20 },
  emptyFooterText: { color: "#8A9284", fontSize: 12, textAlign: "center" },
  pressed: { opacity: 0.7, transform: [{ scale: 0.98 }] },
  disabled: { opacity: 0.55 },
});
