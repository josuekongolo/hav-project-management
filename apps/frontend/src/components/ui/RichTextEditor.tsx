import { useEffect, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const modules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ color: [] }, { background: [] }],
    [{ align: [] }],
    ['link'],
    ['clean'],
  ],
};

const formats = [
  'header',
  'bold',
  'italic',
  'underline',
  'strike',
  'list',
  'bullet',
  'color',
  'background',
  'align',
  'link',
];

export function RichTextEditor({
  value,
  onChange,
  placeholder,
  className = '',
  disabled = false,
}: RichTextEditorProps) {
  const quillRef = useRef<ReactQuill>(null);

  useEffect(() => {
    // Focus the editor on mount if not disabled
    if (quillRef.current && !disabled) {
      const editor = quillRef.current.getEditor();
      if (editor) {
        editor.focus();
      }
    }
  }, [disabled]);

  return (
    <div className={`rich-text-editor ${className}`}>
      <style>{`
        .rich-text-editor .quill {
          background: white;
          border-radius: 0.5rem;
        }
        .rich-text-editor .ql-toolbar {
          border-top-left-radius: 0.5rem;
          border-top-right-radius: 0.5rem;
          border: 1px solid #e5e7eb;
          background: #f9fafb;
        }
        .rich-text-editor .ql-container {
          border-bottom-left-radius: 0.5rem;
          border-bottom-right-radius: 0.5rem;
          border: 1px solid #e5e7eb;
          border-top: none;
          font-size: 14px;
          min-height: 200px;
        }
        .rich-text-editor .ql-editor {
          min-height: 200px;
          max-height: 400px;
          overflow-y: auto;
        }
        .rich-text-editor .ql-editor.ql-blank::before {
          color: #9ca3af;
          font-style: normal;
        }
        .rich-text-editor .ql-snow .ql-stroke {
          stroke: #4b5563;
        }
        .rich-text-editor .ql-snow .ql-fill {
          fill: #4b5563;
        }
        .rich-text-editor .ql-snow .ql-picker-label {
          color: #4b5563;
        }
        .rich-text-editor .ql-toolbar.ql-snow .ql-picker.ql-expanded .ql-picker-label {
          border-color: #3b82f6;
        }
        .rich-text-editor .ql-snow.ql-toolbar button:hover,
        .rich-text-editor .ql-snow .ql-toolbar button:hover {
          color: #3b82f6;
        }
        .rich-text-editor .ql-snow.ql-toolbar button:hover .ql-stroke,
        .rich-text-editor .ql-snow .ql-toolbar button:hover .ql-stroke {
          stroke: #3b82f6;
        }
        .rich-text-editor .ql-snow.ql-toolbar button.ql-active,
        .rich-text-editor .ql-snow .ql-toolbar button.ql-active {
          color: #3b82f6;
        }
        .rich-text-editor .ql-snow.ql-toolbar button.ql-active .ql-stroke,
        .rich-text-editor .ql-snow .ql-toolbar button.ql-active .ql-stroke {
          stroke: #3b82f6;
        }
        .rich-text-editor .ql-snow.ql-toolbar button.ql-active .ql-fill,
        .rich-text-editor .ql-snow .ql-toolbar button.ql-active .ql-fill {
          fill: #3b82f6;
        }
      `}</style>
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        readOnly={disabled}
      />
    </div>
  );
}
