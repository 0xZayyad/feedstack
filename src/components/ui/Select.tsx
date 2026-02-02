import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { MaterialIcons } from '@expo/vector-icons';

interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  label?: string;
  style?: any;
}

export function Select({
  value,
  onValueChange,
  options,
  placeholder = 'Select an option',
  label,
  style,
}: SelectProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const isDark = colorScheme === 'dark';
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text style={[styles.label, { color: isDark ? '#D1D5DB' : '#374151' }]}>
          {label}
        </Text>
      )}
      <TouchableOpacity
        onPress={() => setIsOpen(true)}
        style={[
          styles.selectButton,
          {
            borderColor: isDark ? '#4B5563' : '#D1D5DB',
            backgroundColor: isDark ? '#1F2937' : '#fff',
          },
        ]}
      >
        <Text style={[styles.selectText, { color: colors.text }]}>
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <MaterialIcons
          name="arrow-drop-down"
          size={24}
          color={isDark ? '#9BA1A6' : '#687076'}
        />
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
          style={styles.modalOverlay}
        >
          <View
            style={[
              styles.modalContent,
              { backgroundColor: isDark ? '#1F2937' : '#fff' },
            ]}
          >
            <View
              style={[
                styles.modalHeader,
                { borderBottomColor: isDark ? '#374151' : '#E5E7EB' },
              ]}
            >
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {label || 'Select an option'}
              </Text>
            </View>
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    onValueChange(item.value);
                    setIsOpen(false);
                  }}
                  style={[
                    styles.optionItem,
                    {
                      borderBottomColor: isDark ? '#374151' : '#E5E7EB',
                      backgroundColor:
                        value === item.value
                          ? isDark
                            ? '#374151'
                            : '#EFF6FF'
                          : 'transparent',
                    },
                  ]}
                >
                  <Text style={[styles.optionText, { color: colors.text }]}>
                    {item.label}
                  </Text>
                  {value === item.value && (
                    <MaterialIcons
                      name="check"
                      size={24}
                      color={isDark ? '#fff' : '#0a7ea4'}
                    />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  selectButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectText: {
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    padding: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  optionItem: {
    padding: 16,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionText: {
    fontSize: 16,
  },
});
