import React from 'react';

// Added 'errors' and 'name' properties to access validation state from useForm
const InputField = ({ label, name, type = 'text', register, placeholder, errors }) => {
  
  // Determine if there is a validation error for this field
  const hasError = errors && errors[name];

  return (
    <div className="mb-4">
      <label className="block text-sm font-semibold text-gray-700">{label}</label>
      <input
        type={type}
        // Conditionally set border style based on error state
        {...register(name,  { required: true })}
        className={`p-2 border w-full rounded-md 
          ${hasError 
            ? 'border-red-500 focus:ring-red-500' // Red border and ring on error
            : 'border-gray-300 focus:ring-blue-500' // Default blue ring
          } 
          focus:outline-none focus:ring focus:border-blue-300`}
        placeholder={placeholder}
      />
      {/* Display error message if validation fails */}
      {hasError && (
        <p className="mt-1 text-xs text-red-500">
          {label} is required.
        </p>
      )}
    </div>
  );
};

export default InputField;