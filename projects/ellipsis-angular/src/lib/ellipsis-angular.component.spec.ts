import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EllipsisAngularComponent } from './ellipsis-angular.component';

describe('EllipsisAngularComponent', () => {
  let component: EllipsisAngularComponent;
  let fixture: ComponentFixture<EllipsisAngularComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EllipsisAngularComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EllipsisAngularComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
