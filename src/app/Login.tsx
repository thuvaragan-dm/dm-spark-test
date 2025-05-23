import { AnimatePresence, motion } from "motion/react";
import { Button } from "../components/Button";

const Login = () => {
  return (
    <div className="flex w-full flex-1 flex-col overflow-hidden">
      <div className="grid w-full flex-1 grid-cols-6 overflow-hidden @6xl:grid-cols-7">
        {/* form */}
        <div className="items-start-safe scrollbar col-span-3 flex w-full flex-1 flex-col justify-center-safe overflow-y-auto pl-20">
          {/* logo */}
          <div className="flex w-min items-center justify-center gap-2">
            <div className="bg-primary w-min rounded-full stroke-white p-2 text-white">
              <svg
                className="size-8"
                fill="none"
                viewBox="0 0 227 228"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 124.669c0 56.279 45.623 91.36 101.902 91.36 56.278 0 101.901-45.623 101.901-101.901S176.448 12.227 113.902 12.227c-43.572 0-88.001-5.742-88.001 40.532 0 46.275-4.275 75.51 54.268 24.122 63.249-55.518 109.631 37.247 73.79 73.088-35.841 35.841-78.007 0-78.007 0"
                  stroke="currentColor"
                  strokeWidth={22.033}
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <h2 className="font-gilroy text-2xl font-medium text-gray-800 @6xl:text-3xl dark:text-white">
              DeepModel
            </h2>
          </div>
          {/* logo */}

          <h1 className="mt-10 w-full max-w-md text-5xl font-medium text-balance text-gray-800 @6xl:text-6xl dark:text-white">
            This is the fastest way to build enterprise-grade AI agents
          </h1>

          <div className="mt-10 w-full max-w-xs">
            <Button
              onClick={() => {
                const signInUrl = "http://localhost:3000/desktop-app-login";
                if (window.electronAPI && window.electronAPI.send) {
                  // Send a message to the main process to open the URL
                  window.electronAPI.send("open-external-url", signInUrl);
                }
              }}
              wrapperClass="w-full"
              className={"w-full"}
            >
              Sign in to Deepmodel
            </Button>
            <p className="mt-5 max-w-sm text-sm/6 text-gray-600 dark:text-white/60">
              We'll take you to your web browser to sign in and then bring you
              back here.
            </p>
          </div>

          <footer>
            <p className="mt-10 max-w-60 text-[0.65rem] text-gray-600 dark:text-white/50">
              By clicking Continue you confirm that you agree to
              Deepmodel&apos;s{" "}
              <a
                onClick={(e) => {
                  e.preventDefault();
                  const privacyUrl =
                    "https://copilot.deepmodel.ai/privacy-policy";
                  window.electronAPI.send("open-external-url", privacyUrl);
                }}
                className="text-primary cursor-pointer px-0.5 underline dark:text-white"
              >
                Privacy Policy
              </a>
            </p>
          </footer>
        </div>
        {/* form */}

        {/* illustration */}
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="col-span-3 flex w-full flex-1 items-center justify-end overflow-hidden p-10 @6xl:col-span-4"
          >
            <div className="relative size-full">
              {/* circle */}
              <div className="absolute inset-0 flex items-start justify-center">
                <div className="mt-10 aspect-square w-[80%] max-w-xl rounded-full bg-gradient-to-b from-white/20 to-transparent"></div>
              </div>
              {/* circle */}

              <svg
                className="animate-rocket relative h-full w-full text-gray-800 dark:text-white"
                aria-hidden="true"
                viewBox="0 0 621 608"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M426.132 542.339l3.399-38.311 29.632-9.325c.03 8.388 3.261 27.261 15.944 35.648 12.683 8.387 16.535 15.939 16.876 18.666l-65.851-6.678z"
                  fill="#374151"
                />
                <path
                  d="M426.132 542.339l3.399-38.311 29.632-9.325c.03 8.388 3.261 27.261 15.944 35.648 12.683 8.387 16.535 15.939 16.876 18.666l-65.851-6.678z"
                  fill="url(#paint1_linear_275_1352)"
                />
                <path
                  transform="rotate(5.767 426.066 541.828)"
                  fill="var(--color-primary)"
                  d="M426.066 541.828H492.4901V549.828H426.066z"
                />
                <path
                  d="M477.863 506.321l.141-99.871-55.323 14.982.948 83.487a2 2 0 001.943 1.976l50.234 1.422a2 2 0 002.057-1.996z"
                  fill="var(--color-primary)"
                />
                <path
                  d="M477.863 506.321l.141-99.871-55.323 14.982.948 83.487a2 2 0 001.943 1.976l50.234 1.422a2 2 0 002.057-1.996z"
                  fill="url(#paint2_linear_275_1352)"
                />
                <path
                  d="M152.299 314.642l45.045 69.168 136.031-23.42c-57.96-63.293-144.867-56.87-181.076-45.748z"
                  fill="#374151"
                />
                <path
                  d="M152.299 314.642l45.045 69.168 136.031-23.42c-57.96-63.293-144.867-56.87-181.076-45.748z"
                  fill="url(#paint3_linear_275_1352)"
                />
                <path
                  d="M209.187 606.919L225 525.905l134.885-29.31c-29.99 80.411-112.961 107.054-150.698 110.324z"
                  fill="#374151"
                />
                <path
                  d="M209.187 606.919L225 525.905l134.885-29.31c-29.99 80.411-112.961 107.054-150.698 110.324z"
                  fill="url(#paint4_linear_275_1352)"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M603.551 370.908c1.637 1.959 2.688 4.332 3.175 6.838.488 2.506.404 5.1-.379 7.53-8.025 24.917-24.696 44.091-42.491 57.893-18.669 14.48-38.637 23.188-51.346 26.774l-.02.006-.02.004-286.978 55.856-.491.096-.096-.493-1.917-9.849-1.15-5.91-24.444-125.585-.096-.492.492-.096 286.977-55.857.02-.003.021-.003c13.126-1.442 34.903-.859 57.639 5.562 21.673 6.12 44.319 17.641 61.104 37.729z"
                  fill="#374151"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M418.455 488.251L457.288 349.5l-28.691-10.944-230.809 44.924-.491.096.096.492 24.443 125.585 1.151 5.91 1.917 9.849.096.493.491-.096 192.964-37.558z"
                  fill="url(#paint5_linear_275_1352)"
                />
                <path
                  d="M197.297 383.576L225 525.905l-31.358-4.084-23.882-122.698 27.537-15.547z"
                  fill="#1F2A37"
                />
                <path
                  d="M0 421.978l27.703 142.329 165.939-42.486-23.881-122.698L0 421.978z"
                  fill="url(#paint6_linear_275_1352)"
                />
                <path
                  d="M606.631 377.255L211.054 454.25"
                  stroke="url(#paint7_linear_275_1352)"
                  strokeOpacity={0.4}
                  strokeWidth={2}
                />
                <path
                  d="M267.904 102.921c18.148-7.58 27.894 3.059 30.581 9.119-1.278 13.723-3.336 48.148-17.08 45.881-17.5-12-41.001-37.5-13.501-55z"
                  fill="#111928"
                />
                <path
                  d="M234.172 117.595c9.535 6.267 21.653 4.669 27.066-3.567 5.413-8.237 2.071-19.994-7.465-26.26-9.535-6.267-21.653-4.67-27.066 3.567s-2.071 19.994 7.465 26.26z"
                  fill="#111928"
                />
                <path
                  d="M294.406 176.65l.654-24.2-13.512-8.856-5.56 28.39c3.98 3.563 14.437 4.595 18.418 4.666z"
                  fill="#FDBA8C"
                />
                <path
                  d="M294.406 176.65l.654-24.2-13.512-8.856-5.56 28.39c3.98 3.563 14.437 4.595 18.418 4.666z"
                  fill="url(#paint8_linear_275_1352)"
                />
                <path
                  d="M271.924 132.933c-2.463 2.828 10.575 25.46 26.396 20.802 5.468-1.609 7.217-7.307 7.018-14.255-.015-.518.555.014.519-.517-.034-.517-.674-2.095-.727-2.621-.856-8.47-4.01-18.075-6.642-24.303-2.218 1.99-6.843 7.552-7.6 13.88-.945 7.909-6.288 11.26-9.693 8.902-3.666-2.54-6.808-4.716-9.271-1.888z"
                  fill="#FDBA8C"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M303.026 128.824a.676.676 0 00-.423.859l3.003 8.823a.261.261 0 01-.216.344l-3.965.475a.677.677 0 00.161 1.345l3.965-.475a1.617 1.617 0 001.338-2.126l-3.004-8.822a.676.676 0 00-.859-.423zM301.007 144.958c-.862-.046-1.779-.241-3.181-.575a.677.677 0 10-.313 1.318c1.389.331 2.42.556 3.421.61 1.02.055 1.979-.07 3.246-.39a.676.676 0 10-.331-1.313c-1.182.298-2 .395-2.842.35zM276.431 138.591c-.545-.833-.646-1.739-.581-2.704a.677.677 0 10-1.351-.092c-.076 1.115.028 2.359.798 3.537.766 1.173 2.126 2.183 4.357 2.977a.678.678 0 10.455-1.276c-2.066-.736-3.129-1.602-3.678-2.442z"
                  fill="#111928"
                />
                <path
                  d="M369.789 556.5l17-34.5 31 2c-3 7.833-6.8 26.6 2 39 8.8 12.4 9.667 20.833 9 23.5l-59-30z"
                  fill="#374151"
                />
                <path
                  d="M369.789 556.5l17-34.5 31 2c-3 7.833-6.8 26.6 2 39 8.8 12.4 9.667 20.833 9 23.5l-59-30z"
                  fill="url(#paint9_linear_275_1352)"
                />
                <path
                  transform="rotate(26.928 369.912 556)"
                  fill="var(--color-primary)"
                  d="M369.912 556H436.3361V564H369.912z"
                />
                <path
                  d="M344.289 317l-14.5-30.5-52.5-2c-3.334 7-8.4 30.3-2 67.5s34 46 57.5 41.5l100-19.5-51.871 146.72a2 2 0 001.111 2.511l46.331 19.459a2 2 0 002.651-1.153l63.911-173.686c9.762-26.532-10.331-54.543-38.592-53.799L344.289 317z"
                  fill="var(--color-primary)"
                />
                <path
                  d="M344.289 317l-14.5-30.5-52.5-2c-3.334 7-8.4 30.3-2 67.5s34 46 57.5 41.5l100-19.5-51.871 146.72a2 2 0 001.111 2.511l46.331 19.459a2 2 0 002.651-1.153l63.911-173.686c9.762-26.532-10.331-54.543-38.592-53.799L344.289 317z"
                  fill="url(#paint10_linear_275_1352)"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M273.451 339.156c-.077-.677-.15-1.349-.219-2.015 5.312.278 11.696 1.387 18.62 3.291 11.016 3.03 23.516 8.106 35.448 15.209 20.478 12.189 41.229 3.495 63.24-7.166 1.401-.679 2.807-1.365 4.217-2.053l.008-.004c9.593-4.683 19.4-9.47 29.382-12.667 11.474-3.675 23.269-5.282 35.386-2.221 18.719 4.729 30.589 12.332 37.813 20.049.063 1.022.086 2.051.068 3.085-6.712-7.959-18.523-16.18-38.371-21.194-11.632-2.939-23.025-1.421-34.286 2.186-9.833 3.149-19.498 7.866-29.104 12.554l-.007.003c-1.412.69-2.824 1.379-4.234 2.062-21.864 10.589-43.614 19.895-65.135 7.084-11.772-7.007-24.106-12.014-34.955-14.998-6.727-1.851-12.839-2.911-17.871-3.205zm18.048 44.795a41.102 41.102 0 01-1.544-1.424c5.256-3.027 11.89-5.49 19.44-6.099 11.379-.918 24.745 2.381 38.505 14.125l-2.529.493c-12.944-10.586-25.342-13.469-35.815-12.624-6.97.562-13.126 2.779-18.057 5.529zm134.397 9.545l1.008-2.85c6.498-3.552 13.969-6.989 21.87-9.608 13.637-4.52 28.685-6.644 42.242-2.573l-.693 1.881c-12.967-3.855-27.5-1.857-40.92 2.591-8.588 2.846-16.667 6.679-23.507 10.559zm-19.436 54.976l.854-2.415c10.281 16.107 12.348 33.924 10.48 50.132-1.661 14.418-6.439 27.607-11.364 37.29l-1.849-.776c4.851-9.504 9.587-22.521 11.226-36.743 1.778-15.422-.09-32.209-9.347-47.488zm41.887 45.952l-1.71 4.647c-.422-11.42-3.085-21.402-6.167-30.177-1.462-4.162-3.018-8.05-4.48-11.706l-.001-.001-.182-.455c-1.511-3.779-2.919-7.32-3.986-10.62-2.123-6.565-2.99-12.434-.427-17.559 2.019-4.038 5.576-7.17 9.91-9.589 4.336-2.419 9.509-4.159 14.86-5.389 7.829-1.798 16.122-2.523 22.908-2.651l-.742 2.017c-6.52.165-14.341.889-21.718 2.584-5.24 1.204-10.217 2.889-14.333 5.186-4.118 2.298-7.315 5.174-9.096 8.736-2.188 4.375-1.555 9.569.541 16.05 1.043 3.224 2.424 6.702 3.94 10.492l.186.465c1.46 3.649 3.03 7.573 4.507 11.777 2.715 7.731 5.118 16.417 5.99 26.193zM411.533 315.23l4.083-.107c-7.911 4.769-17.903 10.416-27.935 15.374-6.84 3.38-13.715 6.448-19.97 8.697-6.236 2.243-11.935 3.702-16.4 3.806-22.012.512-42.484-22.592-38.69-57.154l2.003.076c-3.788 33.882 16.224 55.553 36.641 55.078 4.136-.096 9.59-1.466 15.769-3.688 6.159-2.215 12.96-5.247 19.761-8.608 8.726-4.313 17.427-9.153 24.738-13.474z"
                  fill="#c8d8fa"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M399.372 530.515L463.288 368l-36.775 7.224 6.275-1.224-51.87 146.72a2 2 0 001.111 2.511l17.343 7.284z"
                  fill="url(#paint11_linear_275_1352)"
                />
                <path
                  d="M408.093 241.423c-3.62.125-19.76 2.67-27.378 3.927l-1.333 17.449c5.33-1.933 17.614-6.076 24.117-7.184 8.129-1.385 11.429 1.374 17.526.335 6.097-1.039 7.124-14.499 3.174-15.302-3.95-.804-11.581.619-16.106.775z"
                  fill="#FDBA8C"
                />
                <path
                  d="M408.093 241.423c-3.62.125-19.76 2.67-27.378 3.927l-1.333 17.449c5.33-1.933 17.614-6.076 24.117-7.184 8.129-1.385 11.429 1.374 17.526.335 6.097-1.039 7.124-14.499 3.174-15.302-3.95-.804-11.581.619-16.106.775z"
                  fill="url(#paint12_linear_275_1352)"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M320.289 289c28.992-5.41 66.097-16.684 87-23.788 0-6.723-6.138-19.609-9.208-25.212l-77.792 10.122V289z"
                  fill="#F9FAFB"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M320.289 289c28.992-5.41 66.097-16.684 87-23.788 0-6.723-6.138-19.609-9.208-25.212l-77.792 10.122V289z"
                  fill="url(#paint13_linear_275_1352)"
                />
                <path
                  d="M427.789 252.5h-2c-2.5 9.5-8 17-11 9-2.025-5.4 1.036-16.552 3.099-23.491a4.217 4.217 0 014.046-3.009h.163c1.626 0 3.088.99 3.692 2.5h10l1.118-1.118a4.718 4.718 0 013.337-1.382c3.071 0 5.321 2.884 4.548 5.856-1.176 4.52-2.696 10.201-4.003 14.644-2.5 8.5-6 11.5-9 9.5-2.977-1.985-4-9-4-12.5z"
                  fill="#6B7280"
                />
                <path
                  d="M430.289 242c-3.6.4-19.5 4.167-27 6v17.5c5.167-2.333 17.1-7.4 23.5-9 8-2 11.5.5 17.5-1s6-15 2-15.5-11.5 1.5-16 2z"
                  fill="#FDBA8C"
                />
                <path
                  d="M430.289 242c-3.6.4-19.5 4.167-27 6v17.5c5.167-2.333 17.1-7.4 23.5-9 8-2 11.5.5 17.5-1s6-15 2-15.5-11.5 1.5-16 2z"
                  fill="url(#paint14_linear_275_1352)"
                />
                <path d="M264.289 303v-62l39.5 56.5-39.5 5.5z" fill="#F9FAFB" />
                <path
                  d="M264.289 303v-62l39.5 56.5-39.5 5.5z"
                  fill="url(#paint15_linear_275_1352)"
                />
                <path
                  d="M414.29 272c0-7.2-5.667-21-8.5-27l-79.5 12c-.333-6.667-1.4-23.8-3-39-1.562-14.838-16.91-38.19-24.927-48.751a1.241 1.241 0 00-1.456-.396 25.16 25.16 0 01-20.398-.757l-.45-.22c-.467-.229-1.028-.164-1.396.204-3.485 3.484-10.738 14.629-16.373 36.42-7.5 29 19.5 93 44.5 99.5 20 5.2 82.333-20.5 111.5-32z"
                  fill="#F9FAFB"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M323.447 219.524l-32.658-5.024 20 45 15.5-2.5c-.322-6.445-1.33-22.671-2.842-37.476z"
                  fill="url(#paint16_linear_275_1352)"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M287.842 133.384l8.248-1.472-.371-2.969-.742-3.34-4.237 1.324-15.258 4.768c1.637.341 3.454 1.563 5.425 2.927l6.935-1.238z"
                  fill="#111928"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M287.842 133.384l8.248-1.472-.371-2.969-.742-3.34-4.237 1.324-15.258 4.768c1.637.341 3.454 1.563 5.425 2.927l6.935-1.238z"
                  fill="url(#paint17_linear_275_1352)"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M297.653 121.126c1.307-.377 4.856-1.09 6.601-1.09l-.742 1.856-1.076-.135c3.623 8.737 5.888 15.563 5.53 17.949-.495.371-3.712 1.855-5.196 1.855-1.53 0-3.711-.742-5.567-3.34-1.855-2.598-4.824-14.102-2.226-15.958.759-.542 1.707-.903 2.676-1.137z"
                  fill="#111928"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M297.653 121.126c1.307-.377 4.856-1.09 6.601-1.09l-.742 1.856-1.076-.135c3.623 8.737 5.888 15.563 5.53 17.949-.495.371-3.712 1.855-5.196 1.855-1.53 0-3.711-.742-5.567-3.34-1.855-2.598-4.824-14.102-2.226-15.958.759-.542 1.707-.903 2.676-1.137z"
                  fill="url(#paint18_linear_275_1352)"
                />
                <path
                  d="M298.687 121.521c1.446-1.033 3.573-1.407 5.234-1.497 1.116-.061 2.095.657 2.495 1.702 2.756 7.214 3.273 13.044 3.143 16.014a2.268 2.268 0 01-1.143 1.888c-.572.323-1.269.653-1.935.82-1.485.371-3.711-.371-5.567-2.969-1.855-2.598-4.824-14.103-2.227-15.958z"
                  fill="#111928"
                />
                <path
                  d="M298.687 121.521c1.446-1.033 3.573-1.407 5.234-1.497 1.116-.061 2.095.657 2.495 1.702 2.756 7.214 3.273 13.044 3.143 16.014a2.268 2.268 0 01-1.143 1.888c-.572.323-1.269.653-1.935.82-1.485.371-3.711-.371-5.567-2.969-1.855-2.598-4.824-14.103-2.227-15.958z"
                  fill="url(#paint19_linear_275_1352)"
                />
                <defs>
                  <linearGradient
                    id="paint0_linear_275_1352"
                    x1={310}
                    y1={0}
                    x2={310}
                    y2={454}
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="#1F2A37" />
                    <stop offset={1} stopColor="#1F2A37" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient
                    id="paint1_linear_275_1352"
                    x1={441.271}
                    y1={499.484}
                    x2={464.555}
                    y2={559.635}
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="#111928" />
                    <stop offset={1} stopColor="#111928" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient
                    id="paint2_linear_275_1352"
                    x1={439.79}
                    y1={443.5}
                    x2={476.79}
                    y2={526}
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="#111928" />
                    <stop offset={1} stopColor="#111928" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient
                    id="paint3_linear_275_1352"
                    x1={306.73}
                    y1={421.435}
                    x2={196.29}
                    y2={367.5}
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="#111928" />
                    <stop offset={1} stopColor="#111928" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient
                    id="paint4_linear_275_1352"
                    x1={312.289}
                    y1={450}
                    x2={201.663}
                    y2={568.263}
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="#111928" />
                    <stop offset={1} stopColor="#111928" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient
                    id="paint5_linear_275_1352"
                    x1={427.288}
                    y1={381.5}
                    x2={316.288}
                    y2={464}
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="#111928" />
                    <stop offset={1} stopColor="#111928" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient
                    id="paint6_linear_275_1352"
                    x1={414.289}
                    y1={397}
                    x2={75.7891}
                    y2={490.5}
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="#6B7280" />
                    <stop
                      offset={0.9999}
                      stopColor="#6B7280"
                      stopOpacity={0.01}
                    />
                    <stop offset={1} stopColor="#c8d8fa" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient
                    id="paint7_linear_275_1352"
                    x1={448.5}
                    y1={404.5}
                    x2={647.5}
                    y2={335.5}
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="#111928" />
                    <stop offset={1} stopColor="#111928" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient
                    id="paint8_linear_275_1352"
                    x1={277.972}
                    y1={137.409}
                    x2={283.939}
                    y2={170.277}
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="#7F270F" />
                    <stop offset={1} stopColor="#7F270F" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient
                    id="paint9_linear_275_1352"
                    x1={399.377}
                    y1={522}
                    x2={399.377}
                    y2={586.5}
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="#111928" />
                    <stop offset={1} stopColor="#111928" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient
                    id="paint10_linear_275_1352"
                    x1={268.289}
                    y1={214}
                    x2={354.789}
                    y2={367}
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="#111928" />
                    <stop offset={1} stopColor="#111928" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient
                    id="paint11_linear_275_1352"
                    x1={409.788}
                    y1={210}
                    x2={419.788}
                    y2={469}
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="#111928" />
                    <stop offset={1} stopColor="#111928" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient
                    id="paint12_linear_275_1352"
                    x1={397.29}
                    y1={264.5}
                    x2={438.79}
                    y2={266}
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="#7F270F" />
                    <stop offset={1} stopColor="#7F270F" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient
                    id="paint13_linear_275_1352"
                    x1={298.789}
                    y1={258.5}
                    x2={397.289}
                    y2={282}
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="#c8d8fa" />
                    <stop offset={1} stopColor="#c8d8fa" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient
                    id="paint14_linear_275_1352"
                    x1={379.289}
                    y1={266}
                    x2={435.289}
                    y2={266}
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="#7F270F" />
                    <stop offset={1} stopColor="#7F270F" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient
                    id="paint15_linear_275_1352"
                    x1={284.039}
                    y1={241}
                    x2={284.039}
                    y2={303}
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="#c8d8fa" />
                    <stop offset={1} stopColor="#c8d8fa" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient
                    id="paint16_linear_275_1352"
                    x1={317.789}
                    y1={274}
                    x2={307.289}
                    y2={234.5}
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="#c8d8fa" />
                    <stop offset={1} stopColor="#c8d8fa" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient
                    id="paint17_linear_275_1352"
                    x1={287.289}
                    y1={117}
                    x2={285.786}
                    y2={134.622}
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="#2563eb" />
                    <stop offset={1} stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient
                    id="paint18_linear_275_1352"
                    x1={307.223}
                    y1={145.272}
                    x2={302.259}
                    y2={133.669}
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="#2563eb" />
                    <stop offset={1} stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient
                    id="paint19_linear_275_1352"
                    x1={302.399}
                    y1={112.985}
                    x2={304.254}
                    y2={134.881}
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="#2563eb" />
                    <stop offset={1} stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </motion.div>
        </AnimatePresence>
        {/* illustration */}
      </div>
    </div>
  );
};

export default Login;
