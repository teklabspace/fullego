'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { sanitizeForSpec, validateForSpec } from '@/utils/validation';

/**
 * Form state + validation for a fixed set of fields.
 *
 * Errors surface on blur and on submit, never while a field is being typed for
 * the first time — showing "Email address is required" after one character is
 * the classic way validation ends up feeling hostile. Once a field HAS an
 * error, it re-checks on every keystroke so the message clears the moment the
 * value becomes valid.
 *
 * Usage:
 *   const form = useFormValidation(
 *     { email: COMMON_SPECS.email, password: COMMON_SPECS.password },
 *     { email: '', password: '' }
 *   );
 *   <input {...form.fieldProps('email')} />
 *   if (!form.validateAll()) return;
 *
 * @param {Record<string, object>} specs   field name -> spec (see fieldSpecs.js)
 * @param {Record<string, any>} initial    starting values
 */
export function useFormValidation(specs, initial = {}) {
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Specs are usually an object literal in the caller's render body, so a plain
  // dependency on them would re-create every callback each render.
  const specsRef = useRef(specs);
  specsRef.current = specs;

  const specFor = useCallback(name => specsRef.current[name] || { kind: 'text', label: name }, []);

  const setValue = useCallback(
    (name, rawValue) => {
      const spec = specFor(name);
      const next = sanitizeForSpec(spec, rawValue);
      setValues(prev => ({ ...prev, [name]: next }));

      // Only re-validate live for a field the user has already been told about.
      setErrors(prev =>
        prev[name] ? { ...prev, [name]: validateForSpec(spec, next) || undefined } : prev
      );
      return next;
    },
    [specFor]
  );

  const handleChange = useCallback(
    event => {
      const { name, value, type, checked } = event.target;
      if (type === 'checkbox') {
        setValues(prev => ({ ...prev, [name]: checked }));
        return;
      }
      setValue(name, value);
    },
    [setValue]
  );

  const handleBlur = useCallback(
    event => {
      const { name } = event.target;
      setTouched(prev => ({ ...prev, [name]: true }));
      setErrors(prev => ({
        ...prev,
        [name]: validateForSpec(specFor(name), values[name]) || undefined,
      }));
    },
    [specFor, values]
  );

  /** Validate every field. Returns true when the form may be submitted. */
  const validateAll = useCallback(() => {
    const nextErrors = {};
    const nextTouched = {};
    Object.keys(specsRef.current).forEach(name => {
      nextTouched[name] = true;
      const error = validateForSpec(specsRef.current[name], values[name]);
      if (error) nextErrors[name] = error;
    });
    setErrors(nextErrors);
    setTouched(nextTouched);
    return Object.keys(nextErrors).length === 0;
  }, [values]);

  /**
   * Merge per-field messages returned by the API's 422 envelope. Keys arrive
   * snake_case (first_name), so both spellings are accepted.
   */
  const setServerErrors = useCallback(serverErrors => {
    if (!serverErrors) return;
    const camel = {};
    Object.entries(serverErrors).forEach(([key, message]) => {
      if (!message) return;
      camel[key] = message;
      camel[key.replace(/_([a-z])/g, (_, c) => c.toUpperCase())] = message;
    });
    setErrors(prev => ({ ...prev, ...camel }));
    setTouched(prev => {
      const next = { ...prev };
      Object.keys(camel).forEach(k => {
        next[k] = true;
      });
      return next;
    });
  }, []);

  const reset = useCallback((nextValues = initial) => {
    setValues(nextValues);
    setErrors({});
    setTouched({});
  }, []);

  /** The message to show for a field, or undefined while it is untouched. */
  const errorFor = useCallback(
    name => (touched[name] ? errors[name] : undefined),
    [errors, touched]
  );

  /**
   * Spread onto an <input> or <textarea>.
   *
   * Only DOM-safe attributes are returned, so this can go straight onto a raw
   * element without React warning about unknown props. The error is fetched
   * separately with `errorFor(name)`.
   *
   * `required` is deliberately emitted as aria-required rather than the native
   * attribute: the native one blocks submit before onSubmit runs, which would
   * replace our inline messages with the browser's own tooltips.
   */
  const fieldProps = useCallback(
    name => {
      const spec = specFor(name);
      return {
        name,
        value: values[name] ?? '',
        onChange: handleChange,
        onBlur: handleBlur,
        maxLength: spec.maxLen,
        'aria-required': spec.required || undefined,
        'aria-invalid': (touched[name] && errors[name] ? true : undefined),
      };
    },
    [errors, handleBlur, handleChange, specFor, touched, values]
  );

  const isValid = useMemo(
    () => Object.values(errors).every(e => !e),
    [errors]
  );

  return {
    values,
    errors,
    touched,
    setValues,
    setValue,
    setErrors,
    handleChange,
    handleBlur,
    validateAll,
    setServerErrors,
    reset,
    fieldProps,
    errorFor,
    specFor,
    isValid,
  };
}

export default useFormValidation;
