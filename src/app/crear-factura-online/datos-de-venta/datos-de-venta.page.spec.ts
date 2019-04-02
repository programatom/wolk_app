import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DatosDeVentaPage } from './datos-de-venta.page';

describe('DatosDeVentaPage', () => {
  let component: DatosDeVentaPage;
  let fixture: ComponentFixture<DatosDeVentaPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DatosDeVentaPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DatosDeVentaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
