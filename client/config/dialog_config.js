const DIALOG_CONFIG = {
  lessonDisabled: {
    title: "You haven't signed up for the course",
    message: 'To listen to this course please click on the button below.',
    actions: [
      {
        label: 'Take the course',
        primary: true,
        keyboardFocused: true,
      },
      {
        label: 'Cancel',
        primary: false,
        keyboardFocused: false,
      },
    ],
  },
  buyCourseOfLesson: {
    title: "You haven't signed up for the course",
    message: 'Do you want to take this course?',
    actions: [
      {
        label: 'Take the course',
        primary: true,
        keyboardFocused: true,
      },
      {
        label: 'Cancel',
        primary: false,
        keyboardFocused: false,
      },
    ],
  },
};

export default DIALOG_CONFIG;
