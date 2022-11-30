import { TestBed } from '@angular/core/testing';

import { EllipsisAngularService } from './ellipsis-angular.service';

describe('EllipsisAngularService', () => {
  let service: EllipsisAngularService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EllipsisAngularService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
