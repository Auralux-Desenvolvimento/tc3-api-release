import { Request, Response } from 'express';
import { getConnection } from 'typeorm';
import * as yup from 'yup'
import AppError from '../../errors';
import City from '../../models/city';
import Course from '../../models/course';
import Member from '../../models/member';
import Team from '../../models/team';
import User from '../../models/user';
import IMemberData from '../../types/member/IMemberData';
import handleError from '../../repos/utils/handleError';
import generateJWT from '../../utils/functions/generateJWT';
import detectProfanity from '../../utils/functions/detectProfanity';
import passwordSchema from '../../utils/schemas/passwordSchema';
import urlRegex from '../../utils/regex/urlRegex';
import memberSchema from '../../utils/schemas/memberSchema';
import advisorSchema from '../../utils/schemas/advisorSchema';
import IAdvisorData from '../../types/advisor/IAdvisorData';
import Advisor from '../../models/advisor';
import hash from '../../utils/functions/password/hash';
import Keyword from '../../models/keyword';
import TeamKeyword from '../../models/teamKeyword';

export interface IRegisterData {
  name: string;
  logoURL?: string;
  email: string
  password: string;
  course: string;
  keywords?: string[];
  city: string;
  theme?: string;
  members: IMemberData[];
  advisors: IAdvisorData[];
}

let schema = yup.object().shape({
  name: yup.string()
    .min(2, "A team name must be at least 2 characters long")
    .max(45, "A team name must have a length of up to 45 characters")
    .required("A team name is required"),
  logoURL: yup.string()
    .url("A tem logo url must be an url")
    .matches(urlRegex, 'Invalid URL'),
  email: yup.string()
    .email("A team email must be an email")
    .required("A team email is required"),
  password: passwordSchema
    .required("A team password is required"),
  course: yup.string()
    .min(3, "A course name must be at least 3 characters long")
    .max(254, "A course name must have a length of up to 254 characters")
    .required("A team course is required"),
  city: yup.string()
    .uuid("A team city must be an uuid")
    .required("A team city is required"),
  theme: yup.string()
    .min(5, "A theme must be at least 5 characters long")
    .max(254, "A theme must have a length of up to 254 characters"),
  members: yup.array()
    .of(memberSchema)
    .required("The team members are required")
    .min(1, "Minimum of one members"),
  advisors: yup.array()
    .of(advisorSchema)
    .required("Advisors are required")
    .min(1, "Minimum of one advisor"),
  keywords: yup.array()
    .of(
      yup.string()
        .min(3, "A keyword name must be at least 3 characters long")
        .max(254, "A keyword name must have a length of up to 254 characters")
        .required(),
    )
});

export default async function register (request: Request, response: Response) {
  let { 
    name,
    logoURL,
    email,
    password,
    course,
    city,
    theme,
    members,
    advisors,
    keywords
  }: IRegisterData = request.body;
  
  members.map(e => {
    e.birthday = new Date(e.birthday);
    return e;
  });

  try {
    await schema.validate({ name, logoURL, email, password, course, city, theme, members, advisors, keywords });
  } catch (error: any) {
    throw new AppError([ 400, error.errors ], 1);
  }

  await detectProfanity("course.name", course);
  await detectProfanity("team.name", name);
  if (keywords) {

  }
  await detectProfanity("keyword.name", keywords);
  if (theme) {
    await detectProfanity("team.themeName", theme);
  }
  for (let i in members) {
    await detectProfanity(`member[${i}].name`, members[i].name);
    await detectProfanity(`member[${i}].role`, members[i].role);
    if (members[i].description) {
      await detectProfanity(`member[${i}].description`, members[i].description as string);
    }
  }
  for (let i in advisors) {
    await detectProfanity(`advisor[${i}].name`, advisors[i].name);
  }

  await getConnection().transaction(async manager => {
    let team = new Team();
    let user = new User();
    
    team.logoURL = logoURL;
    team.city = { id: city } as City;
    team.themeName = theme;

    const possibleCourse = await manager.createQueryBuilder(Course, "course")
      .where("course.id = :course", { course })
      .orWhere("course.name = :course", { course })
      .getOne();
    
    if(possibleCourse) {
      team.course = possibleCourse;
    } else {
      let courseObj = new Course();
      courseObj.name = course.toLocaleLowerCase();

      try {
        await courseObj.validate();
        courseObj = await manager.save(courseObj);
        if (!courseObj) {
          throw new AppError(AppError.INTERNAL_SERVER_ERROR, 0);
        }
      } catch (error: any) {
        handleError(error);
      }

      team.course = courseObj;
    }

    const teamKeywords = [];
    if (keywords) {
      for (let keyword of keywords) {
        teamKeywords.push(new TeamKeyword());
        const teamKeyword = teamKeywords[teamKeywords.length-1];
  
        teamKeyword.team = team;
        const possibleKeyword = await manager.createQueryBuilder(Keyword, "keyword")
          .where("keyword.id = :keyword", { keyword })
          .orWhere("keyword.name = :keyword", { keyword })
          .getOne();
        
        if (possibleKeyword) {
          teamKeyword.keyword = possibleKeyword;
        } else {
          let keywordObj = new Keyword();
          keywordObj.name = keyword.toLocaleLowerCase();
    
          try {
            await keywordObj.validate();
            keywordObj = await manager.save(keywordObj);
            if (!keywordObj) {
              throw new AppError(AppError.INTERNAL_SERVER_ERROR, 0);
            }
          } catch (error: any) {
            handleError(error);
          }
    
          teamKeyword.keyword = keywordObj;
        }
      }    
    }
      
    user.email = email;
    user.name = name;

    try {
      user.password = await hash(password);
    } catch (hashError) {
      throw new AppError(AppError.INTERNAL_SERVER_ERROR, 0);
    }
  
    try {
      await user.validate();
      user = await manager.save(user);
      if (!user) {
        throw new AppError(AppError.INTERNAL_SERVER_ERROR, 0);
      }
    } catch (error: any) {
      handleInnerError(error);
    }

    team.user = user;
    
    try {
      await team.validate();
      team = await manager.save(team);
      if (!team) {
        throw new AppError(AppError.INTERNAL_SERVER_ERROR, 0);
      }
    } catch (error: any) {
      handleInnerError(error);
    }
  
    const memberEntities: Member[] = [];
    for (let member of members) {
      let memberObj = new Member();
      memberObj.name = member.name;
      memberObj.team = team;
      memberObj.photoURL = member.photoURL;
      memberObj.role = member.role;
      memberObj.birthday = member.birthday;
      memberObj.description = member.description;
      memberEntities.push(memberObj);
      try {
        await memberObj.validate();
      } catch (error: any) {
        handleError(error);
      }
    }
    try {
      await manager.save(memberEntities);
    } catch (error: any) {
      handleError(error);
    }

    const advisorEntities: Advisor[] = [];
    for (let advisor of advisors) {
      let advisorObj = new Advisor();
      advisorObj.name = advisor.name;
      advisorObj.team = team;
      advisorObj.photoURL = advisor.photoURL;
      advisorObj.email = advisor.email;
      advisorEntities.push(advisorObj);   
      try {
        await advisorObj.validate();
      } catch (error: any) {
        handleError(error);
      }
    }
    try {
      await manager.save(advisorEntities);
    } catch (error: any) {
      handleError(error);
    }

    if (teamKeywords.length) {
      try {
        await manager.save(teamKeywords);
      } catch (error: any) {
        handleError(error);
      }
    }

    generateJWT(response, team.id);
  });

  return response.status(201).json("The team was successfully created");
}

function handleInnerError (error: Error) {
  handleError(error, (error) => {
    switch (error.code) {
      case "23505":
      // case 1062:
        return new AppError([ 400, "This team already exists." ], 2);
      case "23503":
      // case 1452:
        return new AppError([ 400, "Unknown city." ], 3);
    }
  });
}