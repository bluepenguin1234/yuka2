import { CameraView, useCameraPermissions, type BarcodeScanningResult } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/Button';
import { currentStage, stageLabel, useProfile } from '../../lib/profile';
import { colors, radius, space, type } from '../../lib/theme';

const BARCODE_TYPES = ['ean13', 'ean8', 'upc_a', 'upc_e'] as const;
const RESCAN_DELAY_MS = 2500;

export default function Scan() {
  const router = useRouter();
  const { profile } = useProfile();
  const [permission, requestPermission] = useCameraPermissions();
  const [manualOpen, setManualOpen] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const lockRef = useRef(false);

  useFocusEffect(
    useCallback(() => {
      lockRef.current = false;
    }, [])
  );

  const goToProduct = (barcode: string) => {
    router.push({ pathname: '/product/[barcode]', params: { barcode } });
  };

  const onScanned = (result: BarcodeScanningResult) => {
    if (lockRef.current || !result.data) return;
    lockRef.current = true;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    goToProduct(result.data);
    setTimeout(() => {
      lockRef.current = false;
    }, RESCAN_DELAY_MS);
  };

  const submitManual = () => {
    const code = manualCode.replace(/\D/g, '');
    if (code.length < 8) return;
    setManualOpen(false);
    setManualCode('');
    goToProduct(code);
  };

  if (!permission) {
    return <View style={styles.fill} />;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={[styles.fill, styles.permissionWrap]}>
        <Text style={styles.permissionEmoji}>📷</Text>
        <Text style={type.title}>Ready to check your first product?</Text>
        <Text style={styles.permissionBody}>
          Mamama uses the camera only to read product barcodes. Nothing is photographed or stored.
        </Text>
        <Button label="Enable camera" onPress={requestPermission} />
        <Button label="Type a barcode instead" variant="ghost" onPress={() => setManualOpen(true)} />
        <ManualEntry
          open={manualOpen}
          code={manualCode}
          onChange={setManualCode}
          onClose={() => setManualOpen(false)}
          onSubmit={submitManual}
        />
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.fill}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: [...BARCODE_TYPES] }}
        onBarcodeScanned={onScanned}
      />
      <SafeAreaView style={styles.overlay} pointerEvents="box-none">
        <View style={styles.topBar}>
          <View style={styles.stageChip}>
            <Text style={styles.stageChipText}>{stageLabel(currentStage(profile))}</Text>
          </View>
        </View>
        <View style={styles.frame}>
          <View style={[styles.corner, styles.tl]} />
          <View style={[styles.corner, styles.tr]} />
          <View style={[styles.corner, styles.bl]} />
          <View style={[styles.corner, styles.br]} />
        </View>
        <View style={styles.bottomBar}>
          <Text style={styles.hint}>Point at a product barcode</Text>
          <Pressable onPress={() => setManualOpen(true)} style={styles.manualButton}>
            <Text style={styles.manualButtonText}>Type barcode</Text>
          </Pressable>
        </View>
      </SafeAreaView>
      <ManualEntry
        open={manualOpen}
        code={manualCode}
        onChange={setManualCode}
        onClose={() => setManualOpen(false)}
        onSubmit={submitManual}
      />
    </View>
  );
}

interface ManualEntryProps {
  open: boolean;
  code: string;
  onChange: (v: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}

function ManualEntry({ open, code, onChange, onClose, onSubmit }: ManualEntryProps) {
  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <Pressable style={styles.modalCard} onPress={() => {}}>
          <Text style={type.heading}>Enter a barcode</Text>
          <Text style={styles.modalSub}>The number printed under the bars (8–14 digits).</Text>
          <TextInput
            value={code}
            onChangeText={onChange}
            placeholder="e.g. 3017620422003"
            placeholderTextColor={colors.inkFaint}
            keyboardType="number-pad"
            style={styles.modalInput}
            autoFocus
          />
          <Button label="Check product" onPress={onSubmit} disabled={code.replace(/\D/g, '').length < 8} />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: '#000' },
  permissionWrap: {
    backgroundColor: colors.bg,
    padding: space.lg,
    justifyContent: 'center',
    gap: space.md,
  },
  permissionEmoji: { fontSize: 56 },
  permissionBody: { ...type.bodySoft },
  overlay: { flex: 1, justifyContent: 'space-between' },
  topBar: { alignItems: 'center', paddingTop: space.sm },
  stageChip: {
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radius.pill,
  },
  stageChipText: { color: colors.white, fontWeight: '700', fontSize: 13 },
  frame: {
    alignSelf: 'center',
    width: 260,
    height: 170,
  },
  corner: {
    position: 'absolute',
    width: 34,
    height: 34,
    borderColor: colors.white,
  },
  tl: { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: 12 },
  tr: { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: 12 },
  bl: { bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: 12 },
  br: { bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: 12 },
  bottomBar: { alignItems: 'center', gap: space.sm, paddingBottom: space.lg },
  hint: { color: colors.white, fontSize: 15, fontWeight: '600' },
  manualButton: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: radius.pill,
  },
  manualButtonText: { color: colors.white, fontWeight: '700', fontSize: 14 },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: space.lg,
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: space.lg,
    gap: space.sm,
  },
  modalSub: { ...type.small },
  modalInput: {
    backgroundColor: colors.bg,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: colors.line,
    paddingHorizontal: space.md,
    minHeight: 52,
    fontSize: 18,
    letterSpacing: 1,
    color: colors.ink,
  },
});
