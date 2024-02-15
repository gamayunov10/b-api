import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

import { SortDirection } from '../../../../../base/enums/sort-direction.enum';
import { QuizTop } from '../../../../../base/enums/quiz-top.enum';

export class PlayerTopQueryModel {
  @ApiProperty({ type: Number, required: false, default: 1 })
  @IsOptional()
  pageNumber = 1;

  @ApiProperty({ type: Number, required: false, default: 10 })
  @IsOptional()
  pageSize = 10;

  @ApiProperty({
    type: String,
    required: false,
    default: '?sort=avgScores desc&sort=sumScore desc',
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      value = [value.split(' ')];

      if (
        Object.values(QuizTop).includes(value[0][0]) &&
        Object.values(SortDirection).includes(value[0][1]?.toUpperCase())
      ) {
        value[0][1] = value[0][1]?.toUpperCase();
        return value;
      }

      return [
        [QuizTop.AverageScores, 'DESC'],
        [QuizTop.SumScore, 'DESC'],
      ];
    } else {
      const mappedParams = value.map((el) => {
        el = el.split(' ');
        el[1] = el[1]?.toUpperCase();
        return el;
      });

      const isValid = (el) =>
        Object.values(QuizTop).includes(el[0]) &&
        Object.values(SortDirection).includes(el[1]?.toUpperCase());

      const validationCheck = mappedParams.every(isValid);

      if (validationCheck) {
        return mappedParams;
      }

      return [
        [QuizTop.AverageScores, 'DESC'],
        [QuizTop.SumScore, 'DESC'],
      ];
    }
  })
  sort: Array<[string, 'ASC' | 'DESC']> = [
    [QuizTop.AverageScores, 'DESC'],
    [QuizTop.SumScore, 'DESC'],
  ];
}
