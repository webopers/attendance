function Validator(options) {
  const formElement = document.querySelector(options.form);
  const selectorRules = {};

  const validate = (inputElement, rules) => {
    const errorElement = inputElement.parentElement.querySelector(options.errorSelector);
    let errorMessage;

    selectorRules[rules.selector].forEach((rule) => {
      if (!errorMessage) errorMessage = rule(inputElement.value);
    });

    if (errorMessage) {
      inputElement.parentElement.classList.add("invalid");
      errorElement.innerText = errorMessage;
    } else {
      inputElement.parentElement.classList.remove("invalid");
      errorElement.innerText = "";
    }
    return !errorMessage;
  };

  if (formElement) {
    formElement.onsubmit = (event) => {
      let isFormValid = true;
      event.preventDefault();
      options.rules.forEach((rule) => {
        const inputElement = formElement.querySelector(rule.selector);
        const isValid = validate(inputElement, rule);
        if (!isValid) isFormValid = false;
      });
      if (isFormValid) {
        const enableInputs = formElement.querySelectorAll("[name]:not([disabled])");
        const formValues = Array.from(enableInputs).reduce((values, input) => {
          // eslint-disable-next-line no-return-assign
          return (values[input.name] = input.value) && values;
        }, {});
        if (typeof options.onSubmit === "function") {
          options.onSubmit(formValues);
        } else {
          formElement.submit();
        }
      }
    };

    options.rules.forEach((rule) => {
      const inputElement = formElement.querySelector(rule.selector);
      const errorElement = inputElement.parentElement.querySelector(options.errorSelector);

      if (Array.isArray(selectorRules[rule.selector])) {
        selectorRules[rule.selector].push(rule.test);
      } else {
        selectorRules[rule.selector] = [rule.test];
      }

      if (inputElement) {
        inputElement.onblur = () => validate(inputElement, rule);
        inputElement.oninput = () => {
          inputElement.parentElement.classList.remove("invalid");
          errorElement.innerText = "";
        };
      }
    });
  }
}

Validator.isRequired = (selector, message) => ({
  selector,
  test: (value) => (value.trim() ? undefined : message || "Vui lòng nhập trường này"),
});

Validator.isEmail = (selector, message) => ({
  selector,
  test: (value) => {
    // eslint-disable-next-line no-useless-escape
    const regex = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
    return regex.test(value) ? undefined : message || "Trường này phải là Email";
  },
});

Validator.minLength = (selector, min, message) => ({
  selector,
  test: (value) => (value.length >= min ? undefined : message || `Vui lòng nhập tối thiểu ${min} ký tự`),
});

Validator.isConfirmed = (selector, getConfirmValue, message) => ({
  selector,
  test: (value) => (value === getConfirmValue() ? undefined : message || "Nhập lại không chính xác"),
});

Validator.isPhone = (selector, message) => ({
  selector,
  test: (value) => {
    // eslint-disable-next-line no-useless-escape
    const regex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;
    return regex.test(value) ? undefined : message || "Trường này phải là số điện thoại";
  },
});

export { Validator as default };
