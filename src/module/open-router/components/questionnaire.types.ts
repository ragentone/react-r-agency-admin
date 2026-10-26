export interface ChatQuestionnaireChoice {
  value: string;
  label: string;
  description?: string;
  shortcut?: string;
}

export interface ChatQuestionnaireItem {
  id: string;
  title: string;
  description?: string;
  type?: 'radio' | 'checkbox' | 'text';
  placeholder?: string;
  choices?: ChatQuestionnaireChoice[];
  required?: boolean;
}

export interface ChatQuestionnaireData {
  title?: string;
  description?: string;
  submitLabel?: string;
  items: ChatQuestionnaireItem[];
}
