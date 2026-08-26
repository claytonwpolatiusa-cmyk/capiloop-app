import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import * as Linking from "expo-linking";
import * as MailComposer from "expo-mail-composer";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Alert, FlatList, Image, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { useAuth } from "@/hooks/use-auth";
import { buildMailtoUrl, buildSupportEmail, getHelpNextAction, getHelpTopic, HELP_TOPICS, SUPPORT_EMAIL, type HelpNextAction, type HelpTopicId, type SupportEmailDraft } from "@/lib/help-center";
import { getSupportAssistantReply } from "@/lib/support-assistant";
import { trpc } from "@/lib/trpc";

type PendingAttachment = { fileName: string; mimeType: "image/jpeg" | "image/png" | "image/webp"; base64: string; uri: string };

function normalizeMimeType(mimeType?: string | null): PendingAttachment["mimeType"] {
  return mimeType === "image/png" || mimeType === "image/webp" ? mimeType : "image/jpeg";
}

export default function HelpCenterScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [selectedTopicId, setSelectedTopicId] = useState<HelpTopicId | null>(null);
  const [details, setDetails] = useState("");
  const [isOpeningMail, setIsOpeningMail] = useState(false);
  const [isSendingTicket, setIsSendingTicket] = useState(false);
  const [manualDraft, setManualDraft] = useState<SupportEmailDraft | null>(null);
  const [attachments, setAttachments] = useState<PendingAttachment[]>([]);
  const [assistantQuestion, setAssistantQuestion] = useState("");
  const selectedTopic = useMemo(() => getHelpTopic(selectedTopicId), [selectedTopicId]);
  const nextAction = useMemo(() => selectedTopic ? getHelpNextAction(selectedTopic.id) : null, [selectedTopic]);
  const assistantReply = useMemo(() => getSupportAssistantReply(assistantQuestion), [assistantQuestion]);
  const createTicket = trpc.support.create.useMutation();

  const selectTopic = async (topicId: HelpTopicId) => {
    if (Platform.OS !== "web") await Haptics.selectionAsync();
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
        const result = await MailComposer.composeAsync({ recipients: draft.recipients, subject: draft.subject, body: draft.body, isHtml: false });
        if (result.status === MailComposer.MailComposerStatus.SENT) {
          if (Platform.OS !== "web") await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          Alert.alert("Mensagem enviada", "O e-mail foi preparado e enviado pelo seu dispositivo.");
        } else {
          setManualDraft(draft);
          Alert.alert("Rascunho pronto", "Os dados de contato continuam disponíveis nesta tela para envio manual.");
        }
        return;
      }
      const mailtoUrl = buildMailtoUrl(draft);
      if (!await Linking.canOpenURL(mailtoUrl)) throw new Error("Nenhum cliente de e-mail disponível.");
      await Linking.openURL(mailtoUrl);
    } catch {
      if (Platform.OS !== "web") await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setManualDraft(draft);
      Alert.alert("E-mail não disponível", "Deixamos os dados da mensagem nesta tela para você copiar e enviar de qualquer aplicativo de e-mail.");
    } finally {
      setIsOpeningMail(false);
    }
  };

  const pickAttachments = async () => {
    if (!user) {
      Alert.alert("Entre para anexar imagens", "O login mantém suas imagens vinculadas ao chamado e permite acompanhar a resposta.", [
        { text: "Agora não", style: "cancel" },
        { text: "Ir para Perfil", onPress: () => router.push("/(tabs)/profile" as never) },
      ]);
      return;
    }
    const remaining = 3 - attachments.length;
    if (remaining <= 0) return;
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Acesso às imagens", "Permita o acesso à galeria para anexar uma captura de tela ou imagem ao chamado.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: remaining,
      quality: 0.72,
      base64: true,
    });
    if (result.canceled) return;
    const selected = result.assets.flatMap((asset, index) => {
      if (!asset.base64 || asset.base64.length > 3_000_000) return [];
      return [{
        fileName: asset.fileName || `evidencia-${attachments.length + index + 1}.jpg`,
        mimeType: normalizeMimeType(asset.mimeType),
        base64: asset.base64,
        uri: asset.uri,
      }];
    });
    if (selected.length !== result.assets.length) Alert.alert("Alguma imagem não foi adicionada", "Cada anexo deve ter até aproximadamente 2 MB após a compressão.");
    setAttachments((current) => [...current, ...selected].slice(0, 3));
  };

  const submitTicket = async () => {
    if (!selectedTopic || isSendingTicket) return;
    if (!user) {
      Alert.alert("Entre para acompanhar", "Para gerar protocolo, anexar imagens e acompanhar a resposta, entre ou crie sua conta primeiro.", [
        { text: "Usar e-mail", onPress: () => void sendSupportEmail() },
        { text: "Ir para Perfil", onPress: () => router.push("/(tabs)/profile" as never) },
      ]);
      return;
    }
    setIsSendingTicket(true);
    try {
      const ticket = await createTicket.mutateAsync({
        topic: selectedTopic.id,
        subject: `CapiLoop · ${selectedTopic.title}`,
        details: details.trim() || undefined,
        attachments: attachments.map(({ fileName, mimeType, base64 }) => ({ fileName, mimeType, base64 })),
      });
      if (Platform.OS !== "web") await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setAttachments([]);
      setDetails("");
      Alert.alert("Chamado registrado", `Seu protocolo é ${ticket.protocol}. Você pode acompanhar o status em Meus chamados.`, [
        { text: "Ver chamados", onPress: () => router.push("/support-tickets" as never) },
      ]);
    } catch (error) {
      if (Platform.OS !== "web") await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Não foi possível registrar", error instanceof Error ? error.message : "Tente novamente em instantes ou use o contato por e-mail.");
    } finally {
      setIsSendingTicket(false);
    }
  };

  const runNextAction = async (action: HelpNextAction) => {
    if (Platform.OS !== "web") await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (action.kind === "email") return void sendSupportEmail();
    if (action.route) router.push(action.route as never);
  };

  return (
    <ScreenContainer className="flex-1" containerClassName="bg-[#F8FAF6]">
      <FlatList
        data={HELP_TOPICS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={<View>
          <Pressable accessibilityRole="button" accessibilityLabel="Voltar ao perfil" onPress={() => router.back()} style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}><MaterialIcons name="arrow-back" size={21} color="#151B14" /><Text style={styles.backLabel}>Perfil</Text></Pressable>
          <View style={styles.hero}>
            <View style={styles.heroIcon}><MaterialIcons name="support-agent" size={27} color="#151B14" /></View>
            <View style={styles.eyebrowRow}><View style={styles.eyebrowDot} /><Text style={styles.eyebrow}>SUPORTE CAPILOOP</Text></View>
            <Text style={styles.title}>Como podemos{`\n`}te ajudar?</Text>
            <Text style={styles.subtitle}>Use a Capi para uma orientação rápida ou abra um chamado com protocolo para acompanhar a resposta.</Text>
          </View>
          <View style={styles.assistantCard}>
            <View style={styles.assistantHeader}><View style={styles.assistantAvatar}><MaterialIcons name="smart-toy" size={18} color="#151B14" /></View><View><Text style={styles.assistantEyebrow}>CAPI, ASSISTENTE VIRTUAL</Text><Text style={styles.assistantTitle}>{assistantReply.title}</Text></View></View>
            <Text style={styles.assistantAnswer}>{assistantReply.answer}</Text>
            <TextInput value={assistantQuestion} onChangeText={setAssistantQuestion} placeholder="Ex.: meu PIX não foi confirmado" placeholderTextColor="#859178" returnKeyType="done" style={styles.assistantInput} accessibilityLabel="Pergunte à assistente virtual" />
            {assistantReply.suggestedTopicId ? <Pressable accessibilityRole="button" onPress={() => void selectTopic(assistantReply.suggestedTopicId!)} style={({ pressed }) => [styles.assistantShortcut, pressed && styles.pressed]}><Text style={styles.assistantShortcutText}>Abrir assunto sugerido</Text><MaterialIcons name="arrow-forward" size={16} color="#4D611C" /></Pressable> : null}
          </View>
          <View style={styles.sectionHeading}><Text style={styles.sectionLabel}>SELECIONE UM ASSUNTO</Text>{user ? <Pressable onPress={() => router.push("/support-tickets" as never)}><Text style={styles.historyLink}>Meus chamados</Text></Pressable> : null}</View>
        </View>}
        renderItem={({ item }) => {
          const isSelected = selectedTopicId === item.id;
          return <View style={styles.topicWrap}>
            <Pressable accessibilityRole="button" accessibilityState={{ selected: isSelected }} onPress={() => void selectTopic(item.id)} style={({ pressed }) => [styles.topic, isSelected && styles.topicSelected, pressed && styles.pressed]}><View style={[styles.topicIcon, isSelected && styles.topicIconSelected]}><MaterialIcons name={item.icon as never} size={21} color="#151B14" /></View><View style={styles.topicCopy}><Text style={styles.topicTitle}>{item.title}</Text><Text style={styles.topicDescription}>{item.description}</Text></View><MaterialIcons name={isSelected ? "expand-less" : "chevron-right"} size={23} color={isSelected ? "#151B14" : "#8D9687"} /></Pressable>
            {isSelected ? <View style={styles.expandedCard}>
              <View style={styles.answerHeader}><MaterialIcons name="lightbulb-outline" size={17} color="#556A20" /><Text style={styles.answerLabel}>ANTES DE ENVIAR</Text></View>
              <Text style={styles.answer}>{item.quickAnswer}</Text>
              <Text style={styles.inputLabel}>Quer acrescentar algum detalhe?</Text>
              <TextInput accessibilityLabel="Detalhes do pedido de ajuda" value={details} onChangeText={setDetails} placeholder="Ex.: número do pedido, horário ou o que aconteceu" placeholderTextColor="#8A9284" multiline textAlignVertical="top" style={styles.input} />
              <View style={styles.attachmentArea}><View style={styles.attachmentHeading}><View><Text style={styles.inputLabelInline}>IMAGENS OU CAPTURAS</Text><Text style={styles.attachmentHint}>Até 3 imagens para explicar melhor o problema.</Text></View><Pressable accessibilityRole="button" onPress={() => void pickAttachments()} style={({ pressed }) => [styles.attachmentButton, pressed && styles.pressed]}><MaterialIcons name="add-photo-alternate" size={17} color="#4D611C" /><Text style={styles.attachmentButtonText}>Adicionar</Text></Pressable></View>{attachments.length ? <View style={styles.attachmentList}>{attachments.map((attachment, index) => <View key={`${attachment.uri}-${index}`} style={styles.attachmentThumb}><Image source={{ uri: attachment.uri }} style={styles.attachmentImage} /><Pressable accessibilityRole="button" accessibilityLabel={`Remover imagem ${index + 1}`} onPress={() => setAttachments((current) => current.filter((_, itemIndex) => itemIndex !== index))} style={styles.removeAttachment}><MaterialIcons name="close" size={14} color="#FFFFFF" /></Pressable></View>)}</View> : null}</View>
              {nextAction ? <View style={styles.nextStep}><View style={styles.nextStepCopy}><Text style={styles.nextStepLabel}>PRÓXIMO PASSO</Text><Text style={styles.nextStepDescription}>{nextAction.description}</Text></View><Pressable accessibilityRole="button" onPress={() => void runNextAction(nextAction)} style={({ pressed }) => [styles.nextStepButton, pressed && styles.pressed]}><MaterialIcons name={nextAction.icon as never} size={18} color="#151B14" /><Text style={styles.nextStepButtonText}>{nextAction.label}</Text><MaterialIcons name="arrow-forward" size={17} color="#151B14" /></Pressable></View> : null}
            </View> : null}
          </View>;
        }}
        ListFooterComponent={selectedTopic ? <View style={styles.footerCard}>
          <Text style={styles.footerTitle}>{user ? "Registrar chamado" : "Ainda precisa de ajuda?"}</Text>
          <Text style={styles.footerCopy}>{user ? "Envie este relato para gerar um protocolo e acompanhar o atendimento em Meus chamados." : "Entre para gerar protocolo, anexar imagens e acompanhar a resposta. Você também pode continuar pelo e-mail."}</Text>
          <Pressable accessibilityRole="button" disabled={isSendingTicket} onPress={() => void submitTicket()} style={({ pressed }) => [styles.ticketButton, (pressed || isSendingTicket) && styles.pressed, isSendingTicket && styles.disabled]}><MaterialIcons name={user ? "send" : "person-outline"} size={20} color="#151B14" /><Text style={styles.ticketButtonText}>{isSendingTicket ? "Registrando…" : user ? "Enviar chamado com protocolo" : "Entrar para acompanhar"}</Text></Pressable>
          <Pressable accessibilityRole="button" disabled={isOpeningMail} onPress={() => void sendSupportEmail()} style={({ pressed }) => [styles.emailButton, (pressed || isOpeningMail) && styles.pressed, isOpeningMail && styles.disabled]}><MaterialIcons name="mail-outline" size={18} color="#D9F8A4" /><Text style={styles.emailButtonText}>{isOpeningMail ? "Abrindo e-mail…" : "Usar contato por e-mail"}</Text></Pressable>
          {manualDraft ? <View style={styles.manualContactCard}><View style={styles.manualContactHeading}><MaterialIcons name="content-copy" size={16} color="#D9F8A4" /><Text style={styles.manualContactLabel}>ALTERNATIVA DISPONÍVEL</Text></View><Text style={styles.manualContactCopy}>Copie estes dados e envie de qualquer aplicativo de e-mail:</Text><Text selectable style={styles.manualContactEmail}>{SUPPORT_EMAIL}</Text><Text selectable style={styles.manualContactSubject}>Assunto: {manualDraft.subject}</Text><Text selectable style={styles.manualContactBody}>{manualDraft.body}</Text></View> : null}
          <Text style={styles.privacyNote}>{user ? "Os anexos são armazenados somente para análise do seu chamado." : "O e-mail é enviado somente após sua confirmação no aplicativo escolhido."}</Text>
        </View> : <View style={styles.emptyFooter}><Text style={styles.emptyFooterText}>Escolha uma opção para continuar.</Text></View>}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingBottom: 32 }, backButton: { alignSelf: "flex-start", minHeight: 42, flexDirection: "row", alignItems: "center", gap: 6, marginTop: 6, paddingRight: 12 }, backLabel: { color: "#151B14", fontSize: 13, fontWeight: "800" }, hero: { marginTop: 15, marginBottom: 22 }, heroIcon: { width: 52, height: 52, borderRadius: 18, backgroundColor: "#A5DF00", alignItems: "center", justifyContent: "center", marginBottom: 18 }, eyebrowRow: { flexDirection: "row", alignItems: "center", gap: 7, marginBottom: 7 }, eyebrowDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#A5DF00" }, eyebrow: { color: "#5E665B", fontSize: 10, fontWeight: "900", letterSpacing: 1.3 }, title: { color: "#151B14", fontSize: 34, fontWeight: "900", letterSpacing: -1.5, lineHeight: 38 }, subtitle: { color: "#65705F", fontSize: 14, lineHeight: 20, marginTop: 10, maxWidth: 328 }, assistantCard: { borderRadius: 20, padding: 14, marginBottom: 23, backgroundColor: "#EAF7C8", borderWidth: 1, borderColor: "#CBEF83" }, assistantHeader: { flexDirection: "row", alignItems: "center", gap: 9 }, assistantAvatar: { width: 34, height: 34, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: "#A5DF00" }, assistantEyebrow: { color: "#60742E", fontWeight: "900", letterSpacing: 0.7, fontSize: 9 }, assistantTitle: { color: "#293516", fontWeight: "900", fontSize: 13, marginTop: 1 }, assistantAnswer: { color: "#445238", fontSize: 12, lineHeight: 17, marginTop: 10 }, assistantInput: { minHeight: 42, borderRadius: 12, paddingHorizontal: 12, marginTop: 11, backgroundColor: "#FFFFFF", color: "#151B14", fontSize: 12, borderWidth: 1, borderColor: "#D2E8A3" }, assistantShortcut: { alignSelf: "flex-start", flexDirection: "row", gap: 5, alignItems: "center", marginTop: 10, paddingVertical: 4 }, assistantShortcutText: { color: "#4D611C", fontSize: 11, fontWeight: "900" }, sectionHeading: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 9 }, sectionLabel: { color: "#6F786A", fontSize: 10, fontWeight: "900", letterSpacing: 1.2 }, historyLink: { color: "#4D611C", fontSize: 11, fontWeight: "900" }, topicWrap: { marginBottom: 10 }, topic: { minHeight: 78, flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: 19, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E5EAE1" }, topicSelected: { borderColor: "#A5DF00", backgroundColor: "#FCFFF6" }, topicIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: "#F0F3ED", alignItems: "center", justifyContent: "center" }, topicIconSelected: { backgroundColor: "#A5DF00" }, topicCopy: { flex: 1 }, topicTitle: { color: "#151B14", fontSize: 14, fontWeight: "900" }, topicDescription: { color: "#6D7668", fontSize: 11, lineHeight: 15, marginTop: 3 }, expandedCard: { marginTop: -4, paddingHorizontal: 15, paddingTop: 17, paddingBottom: 15, borderBottomLeftRadius: 19, borderBottomRightRadius: 19, backgroundColor: "#EDF7D9", borderWidth: 1, borderTopWidth: 0, borderColor: "#A5DF00" }, answerHeader: { flexDirection: "row", alignItems: "center", gap: 6 }, answerLabel: { color: "#556A20", fontSize: 10, letterSpacing: 0.8, fontWeight: "900" }, answer: { color: "#354522", fontSize: 12, lineHeight: 17, marginTop: 8 }, inputLabel: { color: "#556A20", fontSize: 11, fontWeight: "900", marginTop: 14, marginBottom: 7 }, input: { minHeight: 84, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 13, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#D7E7BB", color: "#151B14", fontSize: 12, lineHeight: 17 }, attachmentArea: { marginTop: 13 }, attachmentHeading: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 }, inputLabelInline: { color: "#556A20", fontSize: 10, fontWeight: "900", letterSpacing: 0.5 }, attachmentHint: { color: "#647258", fontSize: 10, lineHeight: 14, marginTop: 2 }, attachmentButton: { minHeight: 34, paddingHorizontal: 10, flexDirection: "row", alignItems: "center", gap: 5, borderRadius: 11, backgroundColor: "#F8FDEB", borderWidth: 1, borderColor: "#CBEF83" }, attachmentButtonText: { color: "#4D611C", fontSize: 11, fontWeight: "900" }, attachmentList: { flexDirection: "row", gap: 8, marginTop: 10 }, attachmentThumb: { width: 54, height: 54, borderRadius: 10, overflow: "visible" }, attachmentImage: { width: 54, height: 54, borderRadius: 10, backgroundColor: "#D7E7BB" }, removeAttachment: { position: "absolute", top: -5, right: -5, width: 20, height: 20, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: "#151B14" }, nextStep: { marginTop: 14, paddingTop: 13, borderTopWidth: 1, borderTopColor: "#D7E7BB" }, nextStepCopy: { marginBottom: 10 }, nextStepLabel: { color: "#556A20", fontSize: 10, letterSpacing: 0.8, fontWeight: "900" }, nextStepDescription: { color: "#4B5A3D", fontSize: 11, lineHeight: 16, marginTop: 4 }, nextStepButton: { minHeight: 44, paddingHorizontal: 12, borderRadius: 13, backgroundColor: "#A5DF00", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7 }, nextStepButtonText: { flex: 1, color: "#151B14", fontSize: 12, fontWeight: "900" }, footerCard: { borderRadius: 23, backgroundColor: "#151B14", marginTop: 15, padding: 19 }, footerTitle: { color: "#FFFFFF", fontSize: 18, fontWeight: "900", letterSpacing: -0.4 }, footerCopy: { color: "#D4DBCD", fontSize: 12, lineHeight: 17, marginTop: 6 }, ticketButton: { minHeight: 49, borderRadius: 15, backgroundColor: "#A5DF00", marginTop: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 }, ticketButtonText: { color: "#151B14", fontSize: 14, fontWeight: "900" }, emailButton: { minHeight: 42, marginTop: 9, borderRadius: 14, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7, borderWidth: 1, borderColor: "#51604C" }, emailButtonText: { color: "#D9F8A4", fontSize: 12, fontWeight: "900" }, manualContactCard: { marginTop: 14, borderRadius: 14, padding: 12, backgroundColor: "#2A3526", borderWidth: 1, borderColor: "#53644C" }, manualContactHeading: { flexDirection: "row", alignItems: "center", gap: 6 }, manualContactLabel: { color: "#D9F8A4", fontSize: 10, fontWeight: "900", letterSpacing: 0.7 }, manualContactCopy: { color: "#D4DBCD", fontSize: 11, lineHeight: 16, marginTop: 7 }, manualContactEmail: { color: "#FFFFFF", fontSize: 12, fontWeight: "900", marginTop: 7 }, manualContactSubject: { color: "#D9F8A4", fontSize: 11, lineHeight: 16, marginTop: 5 }, manualContactBody: { color: "#E8EDE3", fontSize: 11, lineHeight: 16, marginTop: 7 }, privacyNote: { color: "#AAB3A3", fontSize: 10, lineHeight: 14, marginTop: 11, textAlign: "center" }, emptyFooter: { paddingVertical: 20 }, emptyFooterText: { color: "#8A9284", fontSize: 12, textAlign: "center" }, pressed: { opacity: 0.7, transform: [{ scale: 0.98 }] }, disabled: { opacity: 0.55 },
});
