import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalPrintPage } from './modal-print.page';

describe('ModalPrintPage', () => {
  let component: ModalPrintPage;
  let fixture: ComponentFixture<ModalPrintPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalPrintPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalPrintPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
