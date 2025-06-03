"use server";

import { revalidatePath } from "next/cache";
import {
  AnnouncementSchema,
  AssignmentSchema,
  ClassSchema,
  ExamSchema,
  LessonSchema,
  ParentSchema,
  ResultSchema,
  StudentSchema,
  SubjectSchema,
  TeacherSchema,
  attendanceSchema,
} from "./formValidationSchemas";
import prisma from "./prisma";
import { clerkClient } from "@clerk/nextjs/server";
import path from "path";
import fs from "fs";

type CurrentState = { success: boolean; error: boolean };

export const createSubject = async (
  currentState: CurrentState,
  data: SubjectSchema
) => {
  try {
    await prisma.subject.create({
      data: {
        name: data.name,
        teachers: {
          connect: data.teachers.map((teacherId) => ({ id: teacherId })),
        },
      },
    });

    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateSubject = async (
  currentState: CurrentState,
  data: SubjectSchema
) => {
  try {
    await prisma.subject.update({
      where: {
        id: data.id,
      },
      data: {
        name: data.name,
        teachers: {
          set: data.teachers.map((teacherId) => ({ id: teacherId })),
        },
      },
    });

    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteSubject = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.subject.delete({
      where: {
        id: parseInt(id),
      },
    });

    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const createClass = async (
  currentState: CurrentState,
  data: ClassSchema
) => {
  try {
    await prisma.class.create({
      data,
    });

    // revalidatePath("/list/class");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateClass = async (
  currentState: CurrentState,
  data: ClassSchema
) => {
  try {
    await prisma.class.update({
      where: {
        id: data.id,
      },
      data,
    });

    // revalidatePath("/list/class");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteClass = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.class.delete({
      where: {
        id: parseInt(id),
      },
    });

    // revalidatePath("/list/class");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const createTeacher = async (
  currentState: CurrentState,
  data: TeacherSchema
) => {
  try {
    const user = await clerkClient.users.createUser({
      username: data.username,
      password: data.password,
      firstName: data.name,
      lastName: data.surname,
      publicMetadata: { role: "teacher" },
    });

    await prisma.teacher.create({
      data: {
        id: user.id,
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address,
        img: data.img || null,
        bloodType: data.bloodType,
        sex: data.sex,
        birthday: data.birthday,
        subjects: {
          connect: data.subjects?.map((subjectId: string) => ({
            id: parseInt(subjectId),
          })),
        },
      },
    });

    // revalidatePath("/list/teachers");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateTeacher = async (
  currentState: CurrentState,
  data: TeacherSchema
) => {
  if (!data.id) {
    return { success: false, error: true };
  }
  try {
    const user = await clerkClient.users.updateUser(data.id, {
      username: data.username,
      ...(data.password !== "" && { password: data.password }),
      firstName: data.name,
      lastName: data.surname,
    });

    await prisma.teacher.update({
      where: {
        id: data.id,
      },
      data: {
        ...(data.password !== "" && { password: data.password }),
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address,
        img: data.img || null,
        bloodType: data.bloodType,
        sex: data.sex,
        birthday: data.birthday,
        subjects: {
          set: data.subjects?.map((subjectId: string) => ({
            id: parseInt(subjectId),
          })),
        },
      },
    });
    // revalidatePath("/list/teachers");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteTeacher = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await clerkClient.users.deleteUser(id);

    await prisma.teacher.delete({
      where: {
        id: id,
      },
    });

    // revalidatePath("/list/teachers");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const createStudent = async (
  currentState: CurrentState,
  data: StudentSchema
) => {
  console.log(data);
  try {
    const classItem = await prisma.class.findUnique({
      where: { id: data.classId },
      include: { _count: { select: { students: true } } },
    });

    if (classItem && classItem.capacity === classItem._count.students) {
      return { success: false, error: true };
    }

    const user = await clerkClient.users.createUser({
      username: data.username,
      password: data.password,
      firstName: data.name,
      lastName: data.surname,
      publicMetadata: { role: "student" },
    });

    await prisma.student.create({
      data: {
        id: user.id,
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address,
        img: data.img || null,
        bloodType: data.bloodType,
        sex: data.sex,
        birthday: data.birthday,
        gradeId: data.gradeId,
        classId: data.classId,
        parentId: data.parentId,
      },
    });

    // revalidatePath("/list/students");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateStudent = async (
  currentState: CurrentState,
  data: StudentSchema
) => {
  if (!data.id) {
    return { success: false, error: true };
  }
  try {
    const user = await clerkClient.users.updateUser(data.id, {
      username: data.username,
      ...(data.password !== "" && { password: data.password }),
      firstName: data.name,
      lastName: data.surname,
    });

    await prisma.student.update({
      where: {
        id: data.id,
      },
      data: {
        ...(data.password !== "" && { password: data.password }),
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address,
        img: data.img || null,
        bloodType: data.bloodType,
        sex: data.sex,
        birthday: data.birthday,
        gradeId: data.gradeId,
        classId: data.classId,
        parentId: data.parentId,
      },
    });
    // revalidatePath("/list/students");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteStudent = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await clerkClient.users.deleteUser(id);

    await prisma.student.delete({
      where: {
        id: id,
      },
    });

    // revalidatePath("/list/students");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const createExam = async (
  currentState: CurrentState,
  data: ExamSchema
) => {
  // const { userId, sessionClaims } = auth();
  // const role = (sessionClaims?.metadata as { role?: string })?.role;

  try {
    // if (role === "teacher") {
    //   const teacherLesson = await prisma.lesson.findFirst({
    //     where: {
    //       teacherId: userId!,
    //       id: data.lessonId,
    //     },
    //   });

    //   if (!teacherLesson) {
    //     return { success: false, error: true };
    //   }
    // }

    await prisma.exam.create({
      data: {
        title: data.title,
        startTime: data.startTime,
        endTime: data.endTime,
        lessonId: data.lessonId,
      },
    });

    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateExam = async (
  currentState: CurrentState,
  data: ExamSchema
) => {
  // const { userId, sessionClaims } = auth();
  // const role = (sessionClaims?.metadata as { role?: string })?.role;

  try {
    // if (role === "teacher") {
    //   const teacherLesson = await prisma.lesson.findFirst({
    //     where: {
    //       teacherId: userId!,
    //       id: data.lessonId,
    //     },
    //   });

    //   if (!teacherLesson) {
    //     return { success: false, error: true };
    //   }
    // }

    await prisma.exam.update({
      where: {
        id: data.id,
      },
      data: {
        title: data.title,
        startTime: data.startTime,
        endTime: data.endTime,
        lessonId: data.lessonId,
      },
    });

    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteExam = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;

  // const { userId, sessionClaims } = auth();
  // const role = (sessionClaims?.metadata as { role?: string })?.role;

  try {
    await prisma.exam.delete({
      where: {
        id: parseInt(id),
        // ...(role === "teacher" ? { lesson: { teacherId: userId! } } : {}),
      },
    });

    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const createAttendance = async (
  currentState: CurrentState,
  formData: FormData
) => {
  try {
    const data = {
      date: new Date(formData.get("date") as string),
      present: formData.get("present") === "true",
      studentId: formData.get("studentId") as string,
      lessonId: parseInt(formData.get("lessonId") as string),
    };

    const validatedData = attendanceSchema.parse(data);

    await prisma.attendance.create({
      data: validatedData,
    });

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateAttendance = async (
  currentState: CurrentState,
  formData: FormData
) => {
  try {
    // Parse and validate the form data
    const rawData = {
      id: parseInt(formData.get("id") as string),
      date: new Date(formData.get("date") as string),
      present: formData.get("present") === "true",
      studentId: formData.get("studentId") as string,
      lessonId: parseInt(formData.get("lessonId") as string),
    };

    const validatedData = attendanceSchema.parse(rawData);

    // Update the attendance record
    await prisma.attendance.update({
      where: {
        id: validatedData.id,
      },
      data: {
        date: validatedData.date,
        present: validatedData.present,
        studentId: validatedData.studentId,
        lessonId: validatedData.lessonId,
      },
    });

    // revalidatePath("/list/attendance");
    return { success: true, error: false };
  } catch (err) {
    console.log("Update Attendance Error:", err);
    return { success: false, error: true };
  }
};

export const deleteAttendance = async (
  currentState: CurrentState,
  formData: FormData
) => {
  const id = parseInt(formData.get("id") as string);
  try {
    await prisma.attendance.delete({
      where: { id },
    });

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const createEvent = async (
  currentState: { success: boolean; error: boolean },
  formData: FormData
) => {
  try {
    const data = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      startTime: new Date(formData.get("startTime") as string),
      endTime: new Date(formData.get("endTime") as string),
    };
    await prisma.event.create({
      data,
    });
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateEvent = async (
  currentState: { success: boolean; error: boolean },
  formData: FormData
) => {
  try {
    const id = formData.get("id") as string;
    const data = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      startTime: new Date(formData.get("startTime") as string),
      endTime: new Date(formData.get("endTime") as string),
    };
    await prisma.event.update({
      where: { id: parseInt(id) },
      data,
    });
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteEvent = async (
  currentState: { success: boolean; error: boolean },
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.event.delete({
      where: { id: parseInt(id) },
    });
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const createParent = async (
  currentState: CurrentState,
  data: ParentSchema
) => {
  try {
    const user = await clerkClient.users.createUser({
      username: data.username,
      password: data.password,
      firstName: data.name,
      lastName: data.surname,
      publicMetadata: { role: "parent" },
    });

    await prisma.parent.create({
      data: {
        id: user.id,
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone,
        address: data.address,
      },
    });

    revalidatePath("/list/parents");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateParent = async (
  currentState: CurrentState,
  data: ParentSchema
) => {
  if (!data.id) {
    return { success: false, error: true };
  }
  try {
    await clerkClient.users.updateUser(data.id, {
      username: data.username,
      ...(data.password !== "" && { password: data.password }),
      firstName: data.name,
      lastName: data.surname,
    });

    await prisma.parent.update({
      where: {
        id: data.id,
      },
      data: {
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone,
        address: data.address,
      },
    });

    revalidatePath("/list/parents");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteParent = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    // First, update all associated students to remove parent reference
    await prisma.student.updateMany({
      where: {
        parentId: id,
      },
      data: {
        parentId: null as any, // Temporary solution to handle parent removal
      },
    });

    await clerkClient.users.deleteUser(id);

    await prisma.parent.delete({
      where: {
        id: id,
      },
    });

    revalidatePath("/list/parents");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const createLesson = async (
  currentState: CurrentState,
  data: LessonSchema
) => {
  // const { userId, sessionClaims } = auth();
  // const role = (sessionClaims?.metadata as { role?: string })?.role;

  try {
    // Check for schedule conflicts
    const existingLesson = await prisma.lesson.findFirst({
      where: {
        classId: data.classId,
        day: data.day,
        OR: [
          {
            AND: [
              { startTime: { lte: data.startTime } },
              { endTime: { gt: data.startTime } },
            ],
          },
          {
            AND: [
              { startTime: { lt: data.endTime } },
              { endTime: { gte: data.endTime } },
            ],
          },
        ],
      },
    });

    if (existingLesson) {
      return {
        success: false,
        error: true,
        message: "Schedule conflict detected",
      };
    }

    await prisma.lesson.create({
      data: {
        name: data.name,
        day: data.day,
        startTime: data.startTime,
        endTime: data.endTime,
        subjectId: data.subjectId,
        classId: data.classId,
        teacherId: data.teacherId,
      },
    });

    revalidatePath("/list/lessons");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateLesson = async (
  currentState: CurrentState,
  data: LessonSchema
) => {
  if (!data.id) {
    return { success: false, error: true };
  }

  // const { userId, sessionClaims } = auth();
  // const role = (sessionClaims?.metadata as { role?: string })?.role;

  try {
    // Check for schedule conflicts excluding the current lesson
    const existingLesson = await prisma.lesson.findFirst({
      where: {
        id: { not: data.id },
        classId: data.classId,
        day: data.day,
        OR: [
          {
            AND: [
              { startTime: { lte: data.startTime } },
              { endTime: { gt: data.startTime } },
            ],
          },
          {
            AND: [
              { startTime: { lt: data.endTime } },
              { endTime: { gte: data.endTime } },
            ],
          },
        ],
      },
    });

    if (existingLesson) {
      return {
        success: false,
        error: true,
        message: "Schedule conflict detected",
      };
    }

    await prisma.lesson.update({
      where: {
        id: data.id,
      },
      data: {
        name: data.name,
        day: data.day,
        startTime: data.startTime,
        endTime: data.endTime,
        subjectId: data.subjectId,
        classId: data.classId,
        teacherId: data.teacherId,
      },
    });

    revalidatePath("/list/lessons");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteLesson = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;

  // const { userId, sessionClaims } = auth();
  // const role = (sessionClaims?.metadata as { role?: string })?.role;

  try {
    // Delete related records first
    await prisma.attendance.deleteMany({
      where: { lessonId: parseInt(id) },
    });

    await prisma.exam.deleteMany({
      where: { lessonId: parseInt(id) },
    });

    await prisma.assignment.deleteMany({
      where: { lessonId: parseInt(id) },
    });

    // Finally delete the lesson
    await prisma.lesson.delete({
      where: {
        id: parseInt(id),
        // ...(role === "teacher" ? { teacherId: userId } : {}),
      },
    });

    revalidatePath("/list/lessons");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const createAssignment = async (
  currentState: CurrentState,
  data: AssignmentSchema
) => {
  // const { userId, sessionClaims } = auth();
  // const role = (sessionClaims?.metadata as { role?: string })?.role;

  try {
    // if (role === "teacher") {
    //   const teacherLesson = await prisma.lesson.findFirst({
    //     where: {
    //       teacherId: userId!,
    //       id: data.lessonId,
    //     },
    //   });

    //   if (!teacherLesson) {
    //     return { success: false, error: true };
    //   }
    // }

    await prisma.assignment.create({
      data: {
        title: data.title,
        startDate: data.startDate,
        dueDate: data.dueDate,
        lessonId: data.lessonId,
      },
    });

    revalidatePath("/list/assignments");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateAssignment = async (
  currentState: CurrentState,
  data: AssignmentSchema
) => {
  if (!data.id) {
    return { success: false, error: true };
  }

  // const { userId, sessionClaims } = auth();
  // const role = (sessionClaims?.metadata as { role?: string })?.role;

  try {
    // if (role === "teacher") {
    //   const teacherLesson = await prisma.lesson.findFirst({
    //     where: {
    //       teacherId: userId!,
    //       id: data.lessonId,
    //     },
    //   });

    //   if (!teacherLesson) {
    //     return { success: false, error: true };
    //   }
    // }

    await prisma.assignment.update({
      where: {
        id: data.id,
      },
      data: {
        title: data.title,
        startDate: data.startDate,
        dueDate: data.dueDate,
        lessonId: data.lessonId,
      },
    });

    revalidatePath("/list/assignments");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteAssignment = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;

  // const { userId, sessionClaims } = auth();
  // const role = (sessionClaims?.metadata as { role?: string })?.role;

  try {
    // Delete related results first
    await prisma.result.deleteMany({
      where: { assignmentId: parseInt(id) },
    });

    // Then delete the assignment
    await prisma.assignment.delete({
      where: {
        id: parseInt(id),
        // ...(role === "teacher" ? { lesson: { teacherId: userId! } } : {}),
      },
    });

    revalidatePath("/list/assignments");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const createResult = async (
  currentState: CurrentState,
  data: ResultSchema
) => {
  // const { userId, sessionClaims } = auth();
  // const role = (sessionClaims?.metadata as { role?: string })?.role;

  try {
    // Check if result already exists for this student and exam/assignment
    const existingResult = await prisma.result.findFirst({
      where: {
        studentId: data.studentId,
        ...(data.examId
          ? { examId: data.examId }
          : { assignmentId: data.assignmentId }),
      },
    });

    if (existingResult) {
      return {
        success: false,
        error: true,
        message: "Result already exists for this student and exam/assignment",
      };
    }

    if (data.examId) {
      // Check if exam exists and belongs to teacher's lesson
      const exam = await prisma.exam.findUnique({
        where: { id: data.examId },
        include: { lesson: true },
      });

      if (!exam) {
        return { success: false, error: true, message: "Exam not found" };
      }

      // if (role === "teacher" && exam.lesson.teacherId !== userId) {
      //   return { success: false, error: true, message: "Unauthorized" };
      // }
    } else if (data.assignmentId) {
      // Check if assignment exists and belongs to teacher's lesson
      const assignment = await prisma.assignment.findUnique({
        where: { id: data.assignmentId },
        include: { lesson: true },
      });

      if (!assignment) {
        return { success: false, error: true, message: "Assignment not found" };
      }

      // if (role === "teacher" && assignment.lesson.teacherId !== userId) {
      //   return { success: false, error: true, message: "Unauthorized" };
      // }
    }

    await prisma.result.create({
      data: {
        score: data.score,
        examId: data.examId,
        assignmentId: data.assignmentId,
        studentId: data.studentId,
      },
    });

    revalidatePath("/list/results");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateResult = async (
  currentState: CurrentState,
  data: ResultSchema
) => {
  if (!data.id) {
    return { success: false, error: true };
  }

  // const { userId, sessionClaims } = auth();
  // const role = (sessionClaims?.metadata as { role?: string })?.role;

  try {
    // Check if result exists and belongs to teacher's lesson
    const existingResult = await prisma.result.findUnique({
      where: { id: data.id },
      include: {
        exam: { include: { lesson: true } },
        assignment: { include: { lesson: true } },
      },
    });

    if (!existingResult) {
      return { success: false, error: true, message: "Result not found" };
    }

    // if (role === "teacher") {
    //   const teacherId = existingResult.exam?.lesson.teacherId ||
    //                     existingResult.assignment?.lesson.teacherId;
    //   if (teacherId !== userId) {
    //     return { success: false, error: true, message: "Unauthorized" };
    //   }
    // }

    await prisma.result.update({
      where: {
        id: data.id,
      },
      data: {
        score: data.score,
        examId: data.examId,
        assignmentId: data.assignmentId,
        studentId: data.studentId,
      },
    });

    revalidatePath("/list/results");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteResult = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;

  // const { userId, sessionClaims } = auth();
  // const role = (sessionClaims?.metadata as { role?: string })?.role;

  try {
    // Check if result exists and belongs to teacher's lesson
    const result = await prisma.result.findUnique({
      where: { id: parseInt(id) },
      include: {
        exam: { include: { lesson: true } },
        assignment: { include: { lesson: true } },
      },
    });

    if (!result) {
      return { success: false, error: true, message: "Result not found" };
    }

    // if (role === "teacher") {
    //   const teacherId = result.exam?.lesson.teacherId ||
    //                     result.assignment?.lesson.teacherId;
    //   if (teacherId !== userId) {
    //     return { success: false, error: true, message: "Unauthorized" };
    //   }
    // }

    await prisma.result.delete({
      where: {
        id: parseInt(id),
      },
    });

    revalidatePath("/list/results");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const createAnnouncement = async (
  currentState: CurrentState,
  data: AnnouncementSchema
) => {
  // const { userId, sessionClaims } = auth();
  // const role = (sessionClaims?.metadata as { role?: string })?.role;

  try {
    // if (role === "teacher" && data.classId) {
    //   const teacherClass = await prisma.class.findFirst({
    //     where: {
    //       id: data.classId,
    //       supervisorId: userId,
    //     },
    //   });
    //   if (!teacherClass) {
    //     return { success: false, error: true, message: "Unauthorized" };
    //   }
    // }

    await prisma.announcement.create({
      data: {
        title: data.title,
        description: data.description,
        date: data.date,
        classId: data.classId,
      },
    });

    revalidatePath("/list/announcements");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateAnnouncement = async (
  currentState: CurrentState,
  data: AnnouncementSchema
) => {
  if (!data.id) {
    return { success: false, error: true };
  }

  // const { userId, sessionClaims } = auth();
  // const role = (sessionClaims?.metadata as { role?: string })?.role;

  try {
    // if (role === "teacher") {
    //   const announcement = await prisma.announcement.findUnique({
    //     where: { id: data.id },
    //     include: { class: true },
    //   });
    //   if (announcement?.class?.supervisorId !== userId) {
    //     return { success: false, error: true, message: "Unauthorized" };
    //   }
    // }

    await prisma.announcement.update({
      where: {
        id: data.id,
      },
      data: {
        title: data.title,
        description: data.description,
        date: data.date,
        classId: data.classId,
      },
    });

    revalidatePath("/list/announcements");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteAnnouncement = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;

  // const { userId, sessionClaims } = auth();
  // const role = (sessionClaims?.metadata as { role?: string })?.role;

  try {
    // if (role === "teacher") {
    //   const announcement = await prisma.announcement.findUnique({
    //     where: { id: parseInt(id) },
    //     include: { class: true },
    //   });
    //   if (announcement?.class?.supervisorId !== userId) {
    //     return { success: false, error: true, message: "Unauthorized" };
    //   }
    // }

    await prisma.announcement.delete({
      where: {
        id: parseInt(id),
      },
    });

    revalidatePath("/list/announcements");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

// Event Document Actions
export const createEventDocument = async (
  currentState: CurrentState,
  formData: FormData
) => {
  try {
    console.log("Starting document upload process...");

    // Extract form data
    const file = formData.get("file") as File;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const eventId = formData.get("eventId") as string;
    const uploadedBy = formData.get("uploadedBy") as string;

    console.log("Form data extracted:", {
      hasFile: !!file,
      fileName: file?.name,
      fileSize: file?.size,
      title,
      eventId,
      uploadedBy,
    });

    // Validate required fields
    if (!file || file.size === 0) {
      console.log("Validation failed: No file provided");
      return { success: false, error: true, message: "File is required" };
    }

    if (!title || title.trim() === "") {
      console.log("Validation failed: No title provided");
      return { success: false, error: true, message: "Title is required" };
    }

    if (!eventId || eventId === "") {
      console.log("Validation failed: No event ID provided");
      return { success: false, error: true, message: "Event is required" };
    }

    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      console.log("Validation failed: File too large", file.size);
      return {
        success: false,
        error: true,
        message: "File size must be less than 5MB",
      };
    }

    // Check file type
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "image/jpeg",
      "image/png",
      "image/gif",
    ];

    if (!allowedTypes.includes(file.type)) {
      console.log("Validation failed: Invalid file type", file.type);
      return {
        success: false,
        error: true,
        message: `Invalid file type: ${file.type}. Allowed types: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, GIF`,
      };
    }

    console.log("File validation passed");

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(
      process.cwd(),
      "public",
      "uploads",
      "documents"
    );
    console.log("Uploads directory path:", uploadsDir);

    try {
      if (!fs.existsSync(uploadsDir)) {
        console.log("Creating uploads directory...");
        fs.mkdirSync(uploadsDir, { recursive: true });
        console.log("Uploads directory created successfully");
      } else {
        console.log("Uploads directory already exists");
      }
    } catch (dirError) {
      console.error("Failed to create uploads directory:", dirError);
      return {
        success: false,
        error: true,
        message: "Failed to create uploads directory",
      };
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = path.extname(file.name);
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const fileName = `${timestamp}_${sanitizedName}`;
    const filePath = path.join(uploadsDir, fileName);
    const publicUrl = `/uploads/documents/${fileName}`;

    console.log("File paths generated:", { fileName, filePath, publicUrl });

    // Save file to disk
    try {
      console.log("Converting file to buffer...");
      const buffer = await file.arrayBuffer();
      console.log("Buffer created, size:", buffer.byteLength);

      console.log("Writing file to disk...");
      fs.writeFileSync(filePath, Buffer.from(buffer));
      console.log("File written successfully to:", filePath);

      // Verify file was written
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        console.log("File verification successful, size:", stats.size);
      } else {
        throw new Error("File was not written to disk");
      }
    } catch (fileError) {
      console.error("File writing failed:", fileError);
      return {
        success: false,
        error: true,
        message: `Failed to save file: ${fileError.message}`,
      };
    }

    // Save to database
    try {
      console.log("Saving to database...");
      const eventDocument = await prisma.eventDocument.create({
        data: {
          title: title.trim(),
          description: description?.trim() || null,
          fileName: file.name,
          fileUrl: publicUrl,
          fileSize: file.size,
          fileType: file.type,
          eventId: parseInt(eventId),
          uploadedBy: uploadedBy || "unknown",
        },
      });
      console.log("Database save successful, document ID:", eventDocument.id);
    } catch (dbError) {
      console.error("Database save failed:", dbError);
      // Clean up the file if database save failed
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log("Cleaned up file after database failure");
        }
      } catch (cleanupError) {
        console.error("Failed to cleanup file:", cleanupError);
      }
      return {
        success: false,
        error: true,
        message: `Database error: ${dbError.message}`,
      };
    }

    console.log("Document upload completed successfully");
    revalidatePath("/list/eventdocs");
    return { success: true, error: false };
  } catch (err) {
    console.error("Unexpected error in createEventDocument:", err);
    return {
      success: false,
      error: true,
      message: `Unexpected error: ${err.message}`,
    };
  }
};

export const updateEventDocument = async (
  currentState: CurrentState,
  formData: FormData
) => {
  try {
    const id = parseInt(formData.get("id") as string);
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const category = formData.get("category") as string;
    const eventId = formData.get("eventId") as string;
    const file = formData.get("file") as File;

    if (!title) {
      return { success: false, error: true, message: "Title is required" };
    }

    let updateData: any = {
      title,
      description: description || null,
      eventId: parseInt(eventId),
    };

    // If new file is uploaded, handle file replacement
    if (file && file.size > 0) {
      // Check file size (5MB limit)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        return {
          success: false,
          error: true,
          message: "File size must be less than 5MB",
        };
      }

      // Get existing document to delete old file
      const existingDoc = await prisma.eventDocument.findUnique({
        where: { id },
      });

      if (existingDoc) {
        // Delete old file
        const fs = require("fs");
        const path = require("path");
        const oldFilePath = path.join(
          process.cwd(),
          "public",
          existingDoc.fileUrl
        );
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }

      // Save new file
      const fs = require("fs");
      const path = require("path");
      const uploadsDir = path.join(
        process.cwd(),
        "public",
        "uploads",
        "documents"
      );

      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const timestamp = Date.now();
      const fileExtension = path.extname(file.name);
      const fileName = `${timestamp}_${file.name.replace(
        /[^a-zA-Z0-9.-]/g,
        "_"
      )}`;
      const filePath = path.join(uploadsDir, fileName);
      const publicUrl = `/uploads/documents/${fileName}`;

      const buffer = await file.arrayBuffer();
      fs.writeFileSync(filePath, Buffer.from(buffer));

      updateData = {
        ...updateData,
        fileName: file.name,
        fileUrl: publicUrl,
        fileSize: file.size,
        fileType: file.type,
      };
    }

    await prisma.eventDocument.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/list/eventdocs");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return {
      success: false,
      error: true,
      message: "Failed to update document",
    };
  }
};

export const deleteEventDocument = async (
  currentState: CurrentState,
  formData: FormData
) => {
  try {
    const id = parseInt(formData.get("id") as string);

    // Get document info to delete file
    const document = await prisma.eventDocument.findUnique({
      where: { id },
    });

    if (document) {
      // Delete file from disk
      const fs = require("fs");
      const path = require("path");
      const filePath = path.join(process.cwd(), "public", document.fileUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      // Delete from database
      await prisma.eventDocument.delete({
        where: { id },
      });
    }

    revalidatePath("/list/eventdocs");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return {
      success: false,
      error: true,
      message: "Failed to delete document",
    };
  }
};

// Event Report Actions
export const createEventReport = async (
  currentState: CurrentState,
  formData: FormData
) => {
  try {
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const reportType = formData.get("reportType") as string;
    const eventId = formData.get("eventId") as string;
    const createdBy = formData.get("createdBy") as string;
    const dateRange = formData.get("dateRange") as string;

    if (!title || !reportType) {
      return {
        success: false,
        error: true,
        message: "Title and report type are required",
      };
    }

    // Generate report content based on type
    let content = "";

    if (reportType === "ATTENDANCE") {
      // Generate attendance report
      const attendanceData = await prisma.attendance.groupBy({
        by: ["present"],
        _count: {
          present: true,
        },
      });

      const totalPresent =
        attendanceData.find((d) => d.present)?._count.present || 0;
      const totalAbsent =
        attendanceData.find((d) => !d.present)?._count.present || 0;

      content = `Attendance Report\n\nTotal Present: ${totalPresent}\nTotal Absent: ${totalAbsent}\nTotal Students: ${
        totalPresent + totalAbsent
      }`;
    } else if (reportType === "SUMMARY") {
      // Generate event summary report
      const events = await prisma.event.findMany({
        where: eventId ? { id: parseInt(eventId) } : {},
        include: {
          _count: {
            select: {
              documents: true,
            },
          },
        },
      });

      content = `Event Summary Report\n\nTotal Events: ${events.length}\n\nEvents Details:\n`;
      events.forEach((e) => {
        content += `- ${e.title} (${e.startTime.toDateString()}) - ${
          e._count.documents
        } documents\n`;
      });
    } else {
      content = description || "Report content";
    }

    await prisma.eventReport.create({
      data: {
        title,
        content,
        reportType: reportType as any,
        eventId: parseInt(eventId),
        createdBy,
      },
    });

    revalidatePath("/list/event-reports");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true, message: "Failed to create report" };
  }
};

export const updateEventReport = async (
  currentState: CurrentState,
  formData: FormData
) => {
  try {
    const id = parseInt(formData.get("id") as string);
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const reportType = formData.get("reportType") as string;
    const eventId = formData.get("eventId") as string;
    const dateRange = formData.get("dateRange") as string;

    if (!title || !reportType) {
      return {
        success: false,
        error: true,
        message: "Title and report type are required",
      };
    }

    // Regenerate report content based on type
    let content = "";

    if (reportType === "ATTENDANCE") {
      const attendanceData = await prisma.attendance.groupBy({
        by: ["present"],
        _count: {
          present: true,
        },
      });

      const totalPresent =
        attendanceData.find((d) => d.present)?._count.present || 0;
      const totalAbsent =
        attendanceData.find((d) => !d.present)?._count.present || 0;

      content = `Attendance Report\n\nTotal Present: ${totalPresent}\nTotal Absent: ${totalAbsent}\nTotal Students: ${
        totalPresent + totalAbsent
      }`;
    } else if (reportType === "SUMMARY") {
      const events = await prisma.event.findMany({
        where: eventId ? { id: parseInt(eventId) } : {},
        include: {
          _count: {
            select: {
              documents: true,
            },
          },
        },
      });

      content = `Event Summary Report\n\nTotal Events: ${events.length}\n\nEvents Details:\n`;
      events.forEach((e) => {
        content += `- ${e.title} (${e.startTime.toDateString()}) - ${
          e._count.documents
        } documents\n`;
      });
    } else {
      content = description || "Report content";
    }

    await prisma.eventReport.update({
      where: { id },
      data: {
        title,
        content,
        reportType: reportType as any,
        eventId: parseInt(eventId),
      },
    });

    revalidatePath("/list/event-reports");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true, message: "Failed to update report" };
  }
};

export const deleteEventReport = async (
  currentState: CurrentState,
  formData: FormData
) => {
  try {
    const id = parseInt(formData.get("id") as string);

    await prisma.eventReport.delete({
      where: { id },
    });

    revalidatePath("/list/event-reports");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true, message: "Failed to delete report" };
  }
};

// Export report as PDF/Excel
export const exportEventReport = async (
  currentState: CurrentState,
  formData: FormData
) => {
  try {
    const id = parseInt(formData.get("id") as string);
    const format = formData.get("format") as string; // 'pdf' or 'excel'

    const report = await prisma.eventReport.findUnique({
      where: { id },
      include: {
        event: true,
      },
    });

    if (!report) {
      return { success: false, error: true, message: "Report not found" };
    }

    // For now, return the report data - in a real implementation,
    // you would generate actual PDF/Excel files here
    const exportData = {
      id: report.id,
      title: report.title,
      description: report.description,
      reportType: report.reportType,
      data: JSON.parse(report.reportData || "{}"),
      createdAt: report.createdAt,
      event: report.event,
      format,
    };

    return {
      success: true,
      error: false,
      data: exportData,
    };
  } catch (err) {
    console.log(err);
    return { success: false, error: true, message: "Failed to export report" };
  }
};

export const approveEvent = async (
  eventId: number,
  principalId: string,
  comments?: string
) => {
  try {
    await prisma.event.update({
      where: { id: eventId },
      data: {
        approvalStatus: "APPROVED",
        approvedBy: principalId,
        approvalDate: new Date(),
        approvalComments: comments || null,
        rejectionReason: null,
      },
    });
    revalidatePath("/list/events");
    return { success: true };
  } catch (err) {
    console.error("Error approving event:", err);
    return { success: false, error: true };
  }
};

export const rejectEvent = async (
  eventId: number,
  principalId: string,
  reason: string
) => {
  try {
    await prisma.event.update({
      where: { id: eventId },
      data: {
        approvalStatus: "REJECTED",
        approvedBy: principalId,
        approvalDate: new Date(),
        rejectionReason: reason,
      },
    });
    revalidatePath("/list/events");
    return { success: true };
  } catch (err) {
    console.error("Error rejecting event:", err);
    return { success: false, error: true };
  }
};
