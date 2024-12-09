import React, { useState } from 'react';
import {
  Box,
  TextField,
  Checkbox,
  FormControlLabel,
  Select,
  MenuItem,
  FormHelperText,
  InputLabel,
  FormControl,
  IconButton,
  Tooltip,
  useTheme,
} from '@mui/material';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import { FormField, FieldType } from '../../types';

interface DynamicFieldsProps {
  fields: Record<string, FormField>;
  onChange: (fieldId: string, value: any) => void;
  onAIAssist?: (fieldId: string) => void;
}

const DynamicFields: React.FC<DynamicFieldsProps> = ({
  fields,
  onChange,
  onAIAssist,
}) => {
  const theme = useTheme();
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const renderField = (fieldId: string, field: FormField) => {
    const commonProps = {
      fullWidth: true,
      onFocus: () => setFocusedField(fieldId),
      onBlur: () => setFocusedField(null),
      sx: {
        mb: 2,
        backgroundColor: field.aiSuggestions ? 'rgba(33, 150, 243, 0.05)' : 'transparent',
      },
    };

    const aiButton = onAIAssist && (
      <Tooltip title="Get AI suggestions">
        <IconButton
          size="small"
          onClick={() => onAIAssist(fieldId)}
          sx={{
            position: 'absolute',
            right: 8,
            top: '50%',
            transform: 'translateY(-50%)',
            opacity: focusedField === fieldId ? 1 : 0,
            transition: 'opacity 0.2s',
            '&:hover': { opacity: 1 },
          }}
        >
          <AutoFixHighIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    );

    switch (field.type) {
      case FieldType.TEXT:
        return (
          <Box sx={{ position: 'relative' }}>
            <TextField
              {...commonProps}
              label={field.label}
              value={field.value}
              onChange={(e) => onChange(fieldId, e.target.value)}
              error={!!field.validation?.some((v) => !v.validator(field.value))}
              helperText={
                field.validation
                  ?.find((v) => !v.validator(field.value))
                  ?.message
              }
            />
            {aiButton}
          </Box>
        );

      case FieldType.SELECT:
        return (
          <FormControl {...commonProps}>
            <InputLabel>{field.label}</InputLabel>
            <Select
              value={field.value}
              label={field.label}
              onChange={(e) => onChange(fieldId, e.target.value)}
            >
              {field.options?.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            {field.validation?.some((v) => !v.validator(field.value)) && (
              <FormHelperText error>
                {
                  field.validation.find((v) => !v.validator(field.value))
                    ?.message
                }
              </FormHelperText>
            )}
          </FormControl>
        );

      case FieldType.CHECKBOX:
        return (
          <FormControlLabel
            control={
              <Checkbox
                checked={field.value}
                onChange={(e) => onChange(fieldId, e.target.checked)}
              />
            }
            label={field.label}
          />
        );

      // Add more field types as needed

      default:
        return null;
    }
  };

  return (
    <Box>
      {Object.entries(fields).map(([fieldId, field]) => (
        <Box key={fieldId}>{renderField(fieldId, field)}</Box>
      ))}
    </Box>
  );
};

export default DynamicFields;
