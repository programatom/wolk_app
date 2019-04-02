import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DatosDeClientePage } from './datos-de-cliente.page';

describe('DatosDeClientePage', () => {
  let component: DatosDeClientePage;
  let fixture: ComponentFixture<DatosDeClientePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DatosDeClientePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DatosDeClientePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
