    <div className="min-h-screen-screen bg-bg-gradient-to-br from-blue-100 to-100 via-via-white to-gray-100 to-gray-600 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="relative bg-white shadow-xl rounded-2xl p-8 max-w-2xl w-full transform transition-all hover:shadow-2xl">
        <img
          src={carImage}
          alt="Car decoration"
          className="absolute -top-12 right-4 w-16 h-auto rounded-lg shadow-md transform rotate-12 hover:scale-110 hover:rotate-0 transition-all duration-300"
          aria-hidden="true"
        />
        <h2 className="text-3xl font-extrabold text-gray-900 mb-6 text-center">
          Complete Your Profile (Step {step}/{role === "client" ? 2 : 3})
        </h2>
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-50 bg-blue-700 text-red-700 p-4 mb-6 rounded-lg">
            {error}
          </div>
        )}
        <Formik initialValues={initialValues} onSubmit={handleSubmit}>
          {({ values, setFieldValue, isSubmitting }) => (
            <Form className="space-y-6">
              {step === 1 && role === "client" && (
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="question"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Are you a student or passenger?
                    </label>
                    <Field
                      as="select"
                      name="question"
                      id="question"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-white text-gray-900 transition-all"
                      onChange={(e) => {
                        setQuestion(e.target.value);
                        setFieldValue("question", e.target.value);
                      }}
                      aria-label="Select passenger type"
                    >
                      <option value="">Select Option</option>
                      <option value="student">Student</option>
                      <option value="passenger">Passenger</option>
                    </Field>
                    {formErrors.question && (
                      <div className="text-red-600 text-sm mt-1">{formErrors.question}</div>
                    )}
                  </div>
                  <button
                    type="button"
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed"
                    onClick={() => values.question && setStep(2)}
                    disabled={!values.question}
                  >
                    Next
                  </button>
                </div>
              )}

                      {step === 2 && role === "client" && (
                <div className="space-y-6">
                  {/* Profile Picture */}
                  <div>
                    <label
                      htmlFor="profilePicture"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Upload Profile Picture
                    </label>
                    <Dropzone
                      onDrop={(files) => setFieldValue("profilePicture", files[0])}
                    >
                      {({ getRootProps, getInputProps, isDragActive }) => (
                        <div
                          {...getRootProps()}
                          className={`p-6 border-2 border-dashed rounded-lg text-center transition-all ${
                            isDragActive
                              ? "border-blue-600 bg-blue-50"
                              : "border-gray-300 bg-gray-50"
                          } hover:bg-gray-100 cursor-pointer`}
                        >
                          <input {...getInputProps()} id="profilePicture" aria-label="Upload profile picture" />
                          <p className="text-gray-600">
                            {isDragActive
                              ? "Drop the profile picture here"
                              : "Drop profile picture here or click to upload"}
                          </p>
                          {values.profilePicture && (
                            <p className="text-sm text-gray-500 mt-2">{values.profilePicture.name}</p>
                          )}
                        </div>
                      )}
                    </Dropzone>
                    {formErrors.profilePicture && (
                      <div className="text-red-600 text-sm mt-1">{formErrors.profilePicture}</div>
                    )}
                  </div>

                  {role === "client" && question === "student" && (
                    <div>
                      <label
                        htmlFor="schoolId"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Upload School ID
                      </label>
                      <Dropzone
                        onDrop={(files) => setFieldValue("schoolId", files[0])}
                      >
                        {({ getRootProps, getInputProps, isDragActive }) => (
                          <div
                            {...getRootProps()}
                            className={`p-6 border-2 border-dashed rounded-lg text-center transition-all ${
                              isDragActive
                                ? "border-blue-600 bg-blue-50"
                                : "border-gray-300 bg-gray-50"
                            } hover:bg-gray-100 cursor-pointer`}
                          >
                            <input {...getInputProps()} id="schoolId" aria-label="Upload school ID" />
                            <p className="text-gray-600">
                              {isDragActive
                                ? "Drop the school ID here"
                                : "Drop school ID here or click to upload"}
                            </p>
                            {values.schoolId && (
                              <p className="text-sm text-gray-500 mt-2">{values.schoolId.name}</p>
                            )}
                          </div>
                        )}
                      </Dropzone>
                      {formErrors.schoolId && (
                        <div className="text-red-600 text-sm mt-1">{formErrors.schoolId}</div>
                      )}
                    </div>
                  )}

            

           

       

                  {/* Location */}
                  <div>
                    <label
                      htmlFor="location.state"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      State
                    </label>
                    <Field
                      as="select"
                      name="location.state"
                      id="location.state"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-white text-gray-900 transition-all"
                      onChange={(e) => {
                        setFieldValue("location.state", e.target.value);
                        setFieldValue("location.lga", "");
                        geocodeLocation(e.target.value, values.location.lga);
                      }}
                      aria-label="Select state"
                    >
                      <option value="">Select State</option>
                      {Object.keys(statesAndLgas).map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </Field>
                    {formErrors["location.state"] && (
                      <div className="text-red-600 text-sm mt-1">{formErrors["location.state"]}</div>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="location.lga"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      LGA
                    </label>
                    <Field
                      as="select"
                      name="location.lga"
                      id="location.lga"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-white text-gray-900 transition-all"
                      onChange={(e) => {
                        setFieldValue("location.lga", e.target.value);
                        geocodeLocation(values.location.state, e.target.value);
                      }}
                      aria-label="Select LGA"
                    >
                      <option value="">Select LGA</option>
                      {values.location.state &&
                        statesAndLgas[values.location.state]?.map((lga) => (
                          <option key={lga} value={lga}>
                            {lga}
                          </option>
                        ))}
                    </Field>
                    {formErrors["location.lga"] && (
                      <div className="text-red-600 text-sm mt-1">{formErrors["location.lga"]}</div>
                    )}
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label
                      htmlFor="phoneNumber"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Phone Number
                    </label>
                    <Field
                      name="phoneNumber"
                      id="phoneNumber"
                      placeholder="Enter phone number"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-white text-gray-900 transition-all"
                      aria-label="Phone number"
                    />
                    {formErrors.phoneNumber && (
                      <div className="text-red-600 text-sm mt-1">{formErrors.phoneNumber}</div>
                    )}
                  </div>

                  {/* Address */}
                  <div>
                    <label
                      htmlFor="location.address"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Address
                    </label>
                    <Field
                      name="location.address"
                      id="location.address"
                      placeholder="Enter address"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-white text-gray-900 transition-all"
                      aria-label="Address"
                    />
                    {formErrors["location.address"] && (
                      <div className="text-red-600 text-sm mt-1">{formErrors["location.address"]}</div>
                    )}
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gender
                    </label>
                    <div className="flex space-x-6">
                      <label className="flex items-center space-x-2">
                        <Field
                          type="radio"
                          name="gender"
                          value="male"
                          className="h-4 w-4 text-blue-600 focus:ring-blue-600"
                          disabled={loading}
                        />
                        <span className="text-gray-700">Male</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <Field
                          type="radio"
                          name="gender"
                          value="female"
                          className="h-4 w-4 text-blue-600 focus:ring-blue-600"
                          disabled={loading}
                        />
                        <span className="text-gray-700">Female</span>
                      </label>
                    </div>
                    {formErrors.gender && (
                      <div className="text-red-600 text-sm mt-1">{formErrors.gender}</div>
                    )}
                  </div>

                  <div className="flex space-x-4 pt-6">
                    {role === "client" && (
                      <button
                        type="button"
                        className="flex-1 bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 focus:ring-2 focus:ring-gray-600 focus:ring-offset-2 transition-all"
                        onClick={() => setStep(1)}
                      >
                        Back
                      </button>
                    )}
                    <button
                      type="submit"
                      className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-600 focus:ring-offset-2 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed"
                      disabled={loading || isSubmitting}
                    >
                      {loading ? "Submitting..." : "Submit"}
                    </button>
                  </div>
                    <button
                    type="button"
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed"
                    onClick={() => values.question && setStep(2)}
                    disabled={!values.question}
                  >
                    Next
                  </button>
                </div>
              )}

              {step === 3 && role === "driver" && (
                <div className="space-y-6">
                  {/* Profile Picture */}
                  <div>
                    <label
                      htmlFor="profilePicture"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Upload Profile Picture
                    </label>
                    <Dropzone
                      onDrop={(files) => setFieldValue("profilePicture", files[0])}
                    >
                      {({ getRootProps, getInputProps, isDragActive }) => (
                        <div
                          {...getRootProps()}
                          className={`p-6 border-2 border-dashed rounded-lg text-center transition-all ${
                            isDragActive
                              ? "border-blue-600 bg-blue-50"
                              : "border-gray-300 bg-gray-50"
                          } hover:bg-gray-100 cursor-pointer`}
                        >
                          <input {...getInputProps()} id="profilePicture" aria-label="Upload profile picture" />
                          <p className="text-gray-600">
                            {isDragActive
                              ? "Drop the profile picture here"
                              : "Drop profile picture here or click to upload"}
                          </p>
                          {values.profilePicture && (
                            <p className="text-sm text-gray-500 mt-2">{values.profilePicture.name}</p>
                          )}
                        </div>
                      )}
                    </Dropzone>
                    {formErrors.profilePicture && (
                      <div className="text-red-600 text-sm mt-1">{formErrors.profilePicture}</div>
                    )}
                  </div>

                  {role === "client" && question === "student" && (
                    <div>
                      <label
                        htmlFor="schoolId"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Upload School ID
                      </label>
                      <Dropzone
                        onDrop={(files) => setFieldValue("schoolId", files[0])}
                      >
                        {({ getRootProps, getInputProps, isDragActive }) => (
                          <div
                            {...getRootProps()}
                            className={`p-6 border-2 border-dashed rounded-lg text-center transition-all ${
                              isDragActive
                                ? "border-blue-600 bg-blue-50"
                                : "border-gray-300 bg-gray-50"
                            } hover:bg-gray-100 cursor-pointer`}
                          >
                            <input {...getInputProps()} id="schoolId" aria-label="Upload school ID" />
                            <p className="text-gray-600">
                              {isDragActive
                                ? "Drop the school ID here"
                                : "Drop school ID here or click to upload"}
                            </p>
                            {values.schoolId && (
                              <p className="text-sm text-gray-500 mt-2">{values.schoolId.name}</p>
                            )}
                          </div>
                        )}
                      </Dropzone>
                      {formErrors.schoolId && (
                        <div className="text-red-600 text-sm mt-1">{formErrors.schoolId}</div>
                      )}
                    </div>
                  )}

                  {role === "driver" && (
                    <>
                      {/* Driver Roles */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Driver Roles (Select all that apply)
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                          {["ride-hauling", "airport", "chartered", "hired"].map((roleOption) => (
                            <label key={roleOption} className="flex items-center space-x-2">
                              <Field
                                type="checkbox"
                                name="driverRoles"
                                value={roleOption}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-600 rounded"
                                onChange={(e) => {
                                  const checked = e.target.checked;
                                  setFieldValue(
                                    "driverRoles",
                                    checked
                                      ? [...values.driverRoles, roleOption]
                                      : values.driverRoles.filter((r) => r !== roleOption)
                                  );
                                }}
                              />
                              <span className="text-gray-700 capitalize">
                                {roleOption.replace("-", " ")}
                              </span>
                            </label>
                          ))}
                        </div>
                        {formErrors.driverRoles && (
                          <div className="text-red-600 text-sm mt-1">{formErrors.driverRoles}</div>
                        )}
                      </div>

                      {/* Interstate */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Willing to Travel Interstate?
                        </label>
                        <div className="flex items-center space-x-4">
                          <Field
                            type="checkbox"
                            name="interstate"
                            className="h-5 w-5 text-blue-600 focus:ring-blue-600 rounded"
                            onChange={(e) => setFieldValue("interstate", e.target.checked)}
                          />
                          <span className="text-gray-700">Yes</span>
                        </div>
                        {formErrors.interstate && (
                          <div className="text-red-600 text-sm mt-1">{formErrors.interstate}</div>
                        )}
                      </div>

                      {/* Hired Details */}
                      {values.driverRoles.includes("hired") && (
                        <div className="border-t pt-4">
                          <h3 className="text-lg font-semibold text-gray-800 mb-4">
                            Hired Driver Details
                          </h3>
                          <div className="space-y-4">
                            <div>
                              <label
                                htmlFor="availableToBeHiredDetails.durationType"
                                className="block text-sm font-medium text-gray-700 mb-2"
                              >
                                Duration Type
                              </label>
                              <Field
                                as="select"
                                name="availableToBeHiredDetails.durationType"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-white text-gray-900 transition-all"
                                aria-label="Select duration type"
                              >
                                <option value="">Select Duration Type</option>
                                {[
                                  "day", "days", "week", "weeks",
                                  "month", "months", "permanent", "temporary",
                                ].map((type) => (
                                  <option key={type} value={type}>
                                    {type.charAt(0).toUpperCase() + type.slice(1)}
                                  </option>
                                ))}
                              </Field>
                              {formErrors["availableToBeHiredDetails.durationType"] && (
                                <div className="text-red-600 text-sm mt-1">
                                  {formErrors["availableToBeHiredDetails.durationType"]}
                                </div>
                              )}
                            </div>
                            {["day", "days", "week", "weeks", "month", "months"].includes(
                              values.availableToBeHiredDetails.durationType
                            ) && (
                              <>
                                <div>
                                  <label
                                    htmlFor="availableToBeHiredDetails.durationValue"
                                    className="block text-sm font-medium text-gray-700 mb-2"
                                  >
                                    Duration Value
                                  </label>
                                  <Field
                                    name="availableToBeHiredDetails.durationValue"
                                    type="number"
                                    placeholder="Enter duration value"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-white text-gray-900 transition-all"
                                    aria-label="Duration value"
                                  />
                                  {formErrors["availableToBeHiredDetails.durationValue"] && (
                                    <div className="text-red-600 text-sm mt-1">
                                      {formErrors["availableToBeHiredDetails.durationValue"]}
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <label
                                    htmlFor="availableToBeHiredDetails.endDate"
                                    className="block text-sm font-medium text-gray-700 mb-2"
                                  >
                                    End Date
                                  </label>
                                  <Field
                                    name="availableToBeHiredDetails.endDate"
                                    type="date"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-white text-gray-900 transition-all"
                                    aria-label="End date"
                                  />
                                  {formErrors["availableToBeHiredDetails.endDate"] && (
                                    <div className="text-red-600 text-sm mt-1">
                                      {formErrors["availableToBeHiredDetails.endDate"]}
                                    </div>
                                  )}
                                </div>
                              </>
                            )}
                            <div>
                              <label
                                htmlFor="availableToBeHiredDetails.minSalary"
                                className="block text-sm font-medium text-gray-700 mb-2"
                              >
                                Minimum Salary (₦)
                              </label>
                              <Field
                                name="availableToBeHiredDetails.minSalary"
                                type="number"
                                placeholder="Enter minimum salary"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-white text-gray-900 transition-all"
                                aria-label="Minimum salary"
                              />
                              {formErrors["availableToBeHiredDetails.minSalary"] && (
                                <div className="text-red-600 text-sm mt-1">
                                  {formErrors["availableToBeHiredDetails.minSalary"]}
                                </div>
                              )}
                            </div>
                            <div>
                              <label
                                htmlFor="availableToBeHiredDetails.interstateTravel"
                                className="block text-sm font-medium text-gray-700 mb-2"
                              >
                                Interstate Travel for Hired Role?
                              </label>
                              <div className="flex items-center space-x-4">
                                <Field
                                  type="checkbox"
                                  name="availableToBeHiredDetails.interstateTravel"
                                  className="h-5 w-5 text-blue-600 focus:ring-blue-600 rounded"
                                  onChange={(e) =>
                                    setFieldValue(
                                      "availableToBeHiredDetails.interstateTravel",
                                      e.target.checked
                                    )
                                  }
                                />
                                <span className="text-gray-700">Yes</span>
                              </div>
                              {formErrors["availableToBeHiredDetails.interstateTravel"] && (
                                <div className="text-red-600 text-sm mt-1">
                                  {formErrors["availableToBeHiredDetails.interstateTravel"]}
                                </div>
                              )}
                            </div>
                            <div>
                              <label
                                htmlFor="availableToBeHiredDetails.typeOfCar"
                                className="block text-sm font-medium text-gray-700 mb-2"
                              >
                                Type of Car
                              </label>
                              <Field
                                as="select"
                                name="availableToBeHiredDetails.typeOfCar"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-white text-gray-900 transition-all"
                                aria-label="Select Type of Car"
                              >
                                <option value="">Select Car Type</option>
                                {["car", "jeep", "mini-bus", "bus", "trailer"].map((type) => (
                                  <option key={type} value={type}>
                                    {type.charAt(0).toUpperCase() + type.slice(1)}
                                  </option>
                                ))}
                              </Field>
                              {formErrors["availableToBeHiredDetails.typeOfCar"] && (
                                <div className="text-red-600 text-sm mt-1">
                                  {formErrors["availableToBeHiredDetails.typeOfCar"]}
                                </div>
                              )}
                            </div>
                            <div>
                              <label
                                htmlFor="availableToBeHiredDetails.typeOfTransmission"
                                className="block text-sm font-medium text-gray-700 mb-2"
                              >
                                Type of Transmission
                              </label>
                              <Field
                                as="select"
                                name="availableToBeHiredDetails.typeOfTransmission"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-white text-gray-900 transition-all"
                                aria-label="Select Type of Transmission"
                              >
                                <option value="">Select Transmission Type</option>
                                {["automatic", "manual", "both"].map((type) => (
                                  <option key={type} value={type}>
                                    {type.charAt(0).toUpperCase() + type.slice(1)}
                                  </option>
                                ))}
                              </Field>
                              {formErrors["availableToBeHiredDetails.typeOfTransmission"] && (
                                <div className="text-red-600 text-sm mt-1">
                                  {formErrors["availableToBeHiredDetails.typeOfTransmission"]}
                                </div>
                              )}
                            </div>
                            <div>
                              <label
                                htmlFor="availableToBeHiredDetails.choice"
                                className="block text-sm font-medium text-gray-700 mb-2"
                              >
                                Choice/Preference
                              </label>
                              <Field
                                as="select"
                                name="availableToBeHiredDetails.choice"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-white text-gray-900 transition-all"
                                aria-label="Select Choice"
                              >
                                <option value="">Select Choice</option>
                                {["private with accommodation","private with no accommodation", "commercial with no accommodation", "commercial with accommodation"].map((type) => (
                                  <option key={type} value={type}>
                                    {type.charAt(0).toUpperCase() + type.slice(1)}
                                  </option>
                                ))}
                              </Field>
                              {formErrors["availableToBeHiredDetails.choice"] && (
                                <div className="text-red-600 text-sm mt-1">
                                  {formErrors["availableToBeHiredDetails.choice"]}
                                </div>
                              )}
                            </div>
                            <div>
                              <label
                                htmlFor="availableToBeHiredDetails.startDate"
                                className="block text-sm font-medium text-gray-700 mb-2"
                              >
                                Start Date
                              </label>
                              <Field
                                name="availableToBeHiredDetails.startDate"
                                type="date"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-white text-gray-900 transition-all"
                                aria-label="Start Date"
                              />
                              {formErrors["availableToBeHiredDetails.startDate"] && (
                                <div className="text-red-600 text-sm mt-1">
                                  {formErrors["availableToBeHiredDetails.startDate"]}
                                </div>
                              )}
                            </div>
                            <div>
                              <label
                                htmlFor="availableToBeHiredDetails.timeToStart"
                                className="block text-sm font-medium text-gray-700 mb-2"
                              >
                                Time to Start
                              </label>
                              <Field
                                name="availableToBeHiredDetails.timeToStart"
                                type="time"
                                placeholder="e.g., 09:00 AM"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-white text-gray-900 transition-all"
                                aria-label="Time to Start"
                              />
                              {formErrors.timeToStart && (
                                <div className="text-red-600 text-sm mt-1">
                                  {formErrors.timeToStart}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* Car Picture */}
                  <div>
                    <label
                      htmlFor="carPicture"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Upload Car Picture
                    </label>
                    <Dropzone
                      onDrop={(files) => setFieldValue("carPicture", files[0])}
                    >
                      {({ getRootProps, getInputProps, isDragActive }) => (
                        <div
                          {...getRootProps()}
                          className={`p-6 border-2 border-dashed rounded-lg text-center transition-all ${
                            isDragActive ? "border-blue-600 bg-blue-50" : "border-gray-300 bg-gray-50"
                          } hover:bg-gray-100 cursor-pointer`}
                        >
                          <input {...getInputProps()} id="carPicture" aria-label="Upload car picture" />
                          <p className="text-gray-600">
                            {isDragActive
                              ? "Drop the car picture here"
                              : "Drop car picture here or click to upload"}
                          </p>
                          {values.carPicture && (
                            <p className="text-sm text-gray-500 mt-2">{values.carPicture.name}</p>
                          )}
                        </div>
                      )}
                    </Dropzone>
                    {formErrors.carPicture && (
                      <div className="text-red-600 text-sm mt-1">{formErrors.carPicture}</div>
                    )}
                  </div>

                  {/* Certificate of Training */}
                  <div>
                    <label
                      htmlFor="certificateTraining"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Upload Certificate of Training
                    </label>
                    <Dropzone
                      onDrop={(files) => setFieldValue("certificateTraining", files[0])}
                    >
                      {({ getRootProps, getInputProps, isDragActive }) => (
                        <div
                          {...getRootProps()}
                          className={`p-6 border-2 border-dashed rounded-lg text-center transition-all ${
                            isDragActive ? "border-blue-600 bg-blue-50" : "border-gray-300 bg-gray-50"
                          } hover:bg-gray-100 cursor-pointer`}
                        >
                          <input
                            {...getInputProps()}
                            id="certificateTraining"
                            aria-label="Upload certificate of training"
                          />
                          <p className="text-gray-600">
                            {isDragActive
                              ? "Drop the certificate here"
                              : "Drop certificate of training here or click to upload"}
                          </p>
                          {values.certificateTraining && (
                            <p className="text-sm text-gray-500 mt-2">{values.certificateTraining.name}</p>
                          )}
                        </div>
                      )}
                    </Dropzone>
                    {formErrors.certificateTraining && (
                      <div className="text-red-600 text-sm mt-1">{formErrors.certificateTraining}</div>
                    )}
                  </div>

                  {/* Driver's License */}
                  <div>
                    <label
                      htmlFor="driverLicense"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Upload Driver's License
                    </label>
                    <Dropzone
                      onDrop={(files) => setFieldValue("driverLicense", files[0])}
                    >
                      {({ getRootProps, getInputProps, isDragActive }) => (
                        <div
                          {...getRootProps()}
                          className={`p-6 border-2 border-dashed rounded-lg text-center transition-all ${
                            isDragActive ? "border-blue-600 bg-blue-50" : "border-gray-300 bg-gray-50"
                          } hover:bg-gray-100 cursor-pointer`}
                        >
                          <input
                            {...getInputProps()}
                            id="driverLicense"
                            aria-label="Upload driver's license"
                          />
                          <p className="text-gray-600">
                            {isDragActive
                              ? "Drop the driver's license here"
                              : "Drop driver's license here or click to upload"}
                          </p>
                          {values.driverLicense && (
                            <p className="text-sm text-gray-500 mt-2">{values.driverLicense.name}</p>
                          )}
                        </div>
                      )}
                    </Dropzone>
                    {formErrors.driverLicense && (
                      <div className="text-red-600 text-sm mt-1">{formErrors.driverLicense}</div>
                    )}
                  </div>

                  {/* Gear Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gear Type (Which can you drive?)
                    </label>
                    <div className="flex flex-wrap gap-4">
                      {["manual", "automatic", "both"].map((type) => (
                        <label key={type} className="flex items-center space-x-2">
                          <Field
                            type="radio"
                            name="gearType"
                            value={type}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-600"
                            disabled={loading}
                          />
                          <span className="text-gray-700 capitalize">{type}</span>
                        </label>
                      ))}
                    </div>
                    {formErrors.gearType && (
                      <div className="text-red-600 text-sm mt-1">{formErrors.gearType}</div>
                    )}
                  </div>

                  {/* Marital Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Marital Status
                    </label>
                    <div className="flex flex-wrap gap-4">
                      {["single", "married", "divorced", "widowed"].map((status) => (
                        <label key={status} className="flex items-center space-x-2">
                          <Field
                            type="radio"
                            name="maritalStatus"
                            value={status}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-600"
                            disabled={loading}
                          />
                          <span className="text-gray-700 capitalize">{status}</span>
                        </label>
                      ))}
                    </div>
                    {formErrors.maritalStatus && (
                      <div className="text-red-600 text-sm mt-1">{formErrors.maritalStatus}</div>
                    )}
                  </div>

                  {/* Vehicle Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vehicle Type
                    </label>
                    <div className="flex flex-wrap gap-4">
                      {["car", "jeep", "mini-bus", "bus", "trailer"].map((type) => (
                        <label key={type} className="flex items-center space-x-2">
                          <Field
                            type="radio"
                            name="vehicleType"
                            value={type}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-600"
                            disabled={loading}
                          />
                          <span className="text-gray-700 capitalize">{type}</span>
                        </label>
                      ))}
                    </div>
                    {formErrors.vehicleType && (
                      <div className="text-red-600 text-sm mt-1">{formErrors.vehicleType}</div>
                    )}
                  </div>

                  {/* Current Location */}
                  <div>
                    <label
                      htmlFor="currentLocation"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Current Location
                    </label>
                    <Field
                      name="currentLocation"
                      id="currentLocation"
                      placeholder="Enter current location"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-white text-gray-900 transition-all"
                      aria-label="Current location"
                    />
                    {formErrors.currentLocation && (
                      <div className="text-red-600 text-sm mt-1">
                        {formErrors.currentLocation}
                      </div>
                    )}
                  </div>

                  {/* Years of Experience */}
                  <div>
                    <label
                      htmlFor="YOE"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Years of Experience
                    </label>
                    <Field
                      name="YOE"
                      id="YOE"
                      type="number"
                      placeholder="Enter years of experience"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-white text-gray-900 transition-all"
                      aria-label="Years of experience"
                    />
                    {formErrors.YOE && (
                      <div className="text-red-600 text-sm mt-1">{formErrors.YOE}</div>
                    )}
                  </div>

                  {/* Language Spoken */}
                  <div>
                    <label
                      htmlFor="languageSpoken"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Language Spoken
                    </label>
                    <Field
                      name="languageSpoken"
                      id="languageSpoken"
                      placeholder="Enter languages spoken"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-white text-gray-900 transition-all"
                      aria-label="Languages spoken"
                    />
                    {formErrors.languageSpoken && (
                      <div className="text-red-600 text-sm mt-1">
                        {formErrors.languageSpoken}
                      </div>
                    )}
                  </div>

                  {/* Car Details */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Car Details
                    </label>
                    <div className="space-y-4">
                      <Field
                        name="carDetails.model"
                        placeholder="Car Model"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-white text-gray-900 transition-all"
                        aria-label="Car model"
                      />
                      {formErrors["carDetails.model"] && (
                        <div className="text-red-600 text-sm">{formErrors["carDetails.model"]}</div>
                      )}
                      <Field
                        name="carDetails.product"
                        placeholder="Car Product"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-white text-gray-900 transition-all"
                        aria-label="Car product"
                      />
                      {formErrors["carDetails.product"] && (
                        <div className="text-red-600 text-sm">{formErrors["carDetails.product"]}</div>
                      )}
                      <Field
                        name="carDetails.year"
                        placeholder="Year"
                        type="number"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-white text-gray-900 transition-all"
                        aria-label="Car year"
                      />
                      {formErrors["carDetails.year"] && (
                        <div className="text-red-600 text-sm">{formErrors["carDetails.year"]}</div>
                      )}
                      <Field
                        name="carDetails.color"
                        placeholder="Color"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-white text-gray-900 transition-all"
                        aria-label="Car color"
                      />
                      {formErrors["carDetails.color"] && (
                        <div className="text-red-600 text-sm">{formErrors["carDetails.color"]}</div>
                      )}
                      <Field
                        name="carDetails.plateNumber"
                        placeholder="Plate Number"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-white text-gray-900 transition-all"
                        aria-label="Car plate number"
                      />
                      {formErrors["carDetails.plateNumber"] && (
                        <div className="text-red-600 text-sm">{formErrors["carDetails.plateNumber"]}</div>
                      )}
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <label
                      htmlFor="location.state"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      State
                    </label>
                    <Field
                      as="select"
                      name="location.state"
                      id="location.state"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-white text-gray-900 transition-all"
                      onChange={(e) => {
                        setFieldValue("location.state", e.target.value);
                        setFieldValue("location.lga", "");
                        geocodeLocation(e.target.value, values.location.lga);
                      }}
                      aria-label="Select state"
                    >
                      <option value="">Select State</option>
                      {Object.keys(statesAndLgas).map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </Field>
                    {formErrors["location.state"] && (
                      <div className="text-red-600 text-sm mt-1">{formErrors["location.state"]}</div>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="location.lga"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      LGA
                    </label>
                    <Field
                      as="select"
                      name="location.lga"
                      id="location.lga"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-white text-gray-900 transition-all"
                      onChange={(e) => {
                        setFieldValue("location.lga", e.target.value);
                        geocodeLocation(values.location.state, e.target.value);
                      }}
                      aria-label="Select LGA"
                    >
                      <option value="">Select LGA</option>
                      {values.location.state &&
                        statesAndLgas[values.location.state]?.map((lga) => (
                          <option key={lga} value={lga}>
                            {lga}
                          </option>
                        ))}
                    </Field>
                    {formErrors["location.lga"] && (
                      <div className="text-red-600 text-sm mt-1">{formErrors["location.lga"]}</div>
                    )}
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label
                      htmlFor="phoneNumber"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Phone Number
                    </label>
                    <Field
                      name="phoneNumber"
                      id="phoneNumber"
                      placeholder="Enter phone number"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-white text-gray-900 transition-all"
                      aria-label="Phone number"
                    />
                    {formErrors.phoneNumber && (
                      <div className="text-red-600 text-sm mt-1">{formErrors.phoneNumber}</div>
                    )}
                  </div>

                  {/* Address */}
                  <div>
                    <label
                      htmlFor="location.address"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Address
                    </label>
                    <Field
                      name="location.address"
                      id="location.address"
                      placeholder="Enter address"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-white text-gray-900 transition-all"
                      aria-label="Address"
                    />
                    {formErrors["location.address"] && (
                      <div className="text-red-600 text-sm mt-1">{formErrors["location.address"]}</div>
                    )}
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gender
                    </label>
                    <div className="flex space-x-6">
                      <label className="flex items-center space-x-2">
                        <Field
                          type="radio"
                          name="gender"
                          value="male"
                          className="h-4 w-4 text-blue-600 focus:ring-blue-600"
                          disabled={loading}
                        />
                        <span className="text-gray-700">Male</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <Field
                          type="radio"
                          name="gender"
                          value="female"
                          className="h-4 w-4 text-blue-600 focus:ring-blue-600"
                          disabled={loading}
                        />
                        <span className="text-gray-700">Female</span>
                      </label>
                    </div>
                    {formErrors.gender && (
                      <div className="text-red-600 text-sm mt-1">{formErrors.gender}</div>
                    )}
                  </div>

                  <div className="flex space-x-4 pt-6">
                    {role === "client" && (
                      <button
                        type="button"
                        className="flex-1 bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 focus:ring-2 focus:ring-gray-600 focus:ring-offset-2 transition-all"
                        onClick={() => setStep(1)}
                      >
                        Back
                      </button>
                    )}
                    <button
                      type="submit"
                      className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-600 focus:ring-offset-2 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed"
                      disabled={loading || isSubmitting}
                    >
                      {loading ? "Submitting..." : "Submit"}
                    </button>
                  </div>
                </div>
              )}
      
            </Form>
          )}
        </Formik>
      </div>
    </div>